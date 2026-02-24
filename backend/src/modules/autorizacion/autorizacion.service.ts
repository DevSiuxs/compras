import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DecidirCotizacionDto } from './dto/decidir-cotizacion.dto';

@Injectable()
export class AutorizarService {
  constructor(private prisma: PrismaService) {}

async listarPendientes() {
  return await this.prisma.solicitud.findMany({
    where: {
      status: {
        in: ['AUTORIZAR', 'PENDIENTE_AJUSTE'] // Trae las nuevas y las que tienen mensaje de compras
      }
    },
    include: {
      empresa: true,
      items: { include: { unidad: true } },
      cotizaciones: true,
      mensajes: true, // <--- ESTA ES LA LÍNEA MÁGICA QUE TE FALTABA
    },
    orderBy: { fechaCreacion: 'asc' },
  });
}
  async obtenerPresupuesto() {
    const p = await this.prisma.configuracionGlobal.findFirst();
    return p || { presupuestoGlobal: 0 };
  }

  async actualizarPresupuesto(monto: number) {
    const p = await this.prisma.configuracionGlobal.findFirst();
    if (p) {
      return this.prisma.configuracionGlobal.update({
        where: { id: p.id },
        data: { presupuestoGlobal: monto },
      });
    } else {
      return this.prisma.configuracionGlobal.create({
        data: { id: 1, presupuestoGlobal: monto },
      });
    }
  }

  async autorizarPropuesta(solicitudId: number, dto: DecidirCotizacionDto) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: dto.cotizacionId }
    });

    const config = await this.prisma.configuracionGlobal.findFirst();
    const disponible = config?.presupuestoGlobal || 0;

    if (!cotizacion || cotizacion.monto > disponible) {
      throw new BadRequestException('Presupuesto insuficiente.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.cotizacion.updateMany({
        where: { solicitudId },
        data: { seleccionada: false }
      });

      await tx.cotizacion.update({
        where: { id: dto.cotizacionId },
        data: { seleccionada: true }
      });

      // Si viene nuevaPrioridad (el color elegido), lo seteamos y reseteamos fecha
      const dataUpdate: any = {
        status: 'COMPRAR',
        prioridad: dto.nuevaPrioridad || 'AZUL',
        fechaResetColor: new Date()
      };

      return tx.solicitud.update({
        where: { id: solicitudId },
        data: dataUpdate
      });
    });
  }
}
