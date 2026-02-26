import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DecidirCotizacionDto } from './dto/decidir-cotizacion.dto';

@Injectable()
export class AutorizarService {
  constructor(private prisma: PrismaService) {}

  async listarPendientes() {
    return await this.prisma.solicitud.findMany({
      where: { status: { in: ['AUTORIZAR', 'PENDIENTE_AJUSTE'] } },
      include: {
        empresa: true,
        items: { include: { unidad: true } },
        cotizaciones: true,
        mensajes: { orderBy: { fecha: 'desc' } },
      },
      orderBy: { fechaCreacion: 'asc' },
    });
  }

  async obtenerPresupuesto() {
    const p = await this.prisma.configuracionGlobal.findFirst();
    return p || { presupuestoGlobal: 0 };
  }

  async actualizarPresupuesto(monto: number) {
    const config = await this.prisma.configuracionGlobal.findFirst();
    if (config) {
      return this.prisma.configuracionGlobal.update({
        where: { id: config.id },
        data: { presupuestoGlobal: monto },
      });
    }
    return this.prisma.configuracionGlobal.create({
      data: { id: 1, presupuestoGlobal: monto },
    });
  }

  async autorizarPropuesta(solicitudId: number, dto: DecidirCotizacionDto) {
    return this.prisma.$transaction(async (tx) => {
      // Marcar cotización elegida
      await tx.cotizacion.updateMany({
        where: { solicitudId },
        data: { seleccionada: false }
      });

      await tx.cotizacion.update({
        where: { id: dto.cotizacionId },
        data: { seleccionada: true }
      });

      // Pasar a compras manteniendo el color manual si se eligió
      return tx.solicitud.update({
        where: { id: solicitudId },
        data: {
          status: 'COMPRAR',
          prioridad: dto.nuevaPrioridad || undefined,
          fechaResetColor: dto.nuevaPrioridad ? new Date() : undefined
        }
      });
    });
  }
}
