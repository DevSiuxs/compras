import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  async listarPendientes() {
    return this.prisma.solicitud.findMany({
      where: {
        status: { in: ['COMPRAR', 'PENDIENTE_AJUSTE'] }
      },
      include: {
        empresa: true,
        items: { include: { unidad: true } },
        cotizaciones: { where: { seleccionada: true } },
        mensajes: true
      },
      orderBy: { fechaCreacion: 'asc' }
    });
  }

  async ejecutarCompra(solicitudId: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: { cotizaciones: { where: { seleccionada: true } } }
    });

    const cotizacionGanadora = solicitud?.cotizaciones[0];
    const config = await this.prisma.configuracionGlobal.findFirst();

    if (!cotizacionGanadora || !config) throw new BadRequestException('Datos incompletos');
    if (config.presupuestoGlobal < cotizacionGanadora.monto) {
      throw new BadRequestException('Fondos insuficientes.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.configuracionGlobal.update({
        where: { id: config.id },
        data: { presupuestoGlobal: { decrement: cotizacionGanadora.monto } }
      });

      return tx.solicitud.update({
        where: { id: solicitudId },
        data: {
          status: 'RECIBIDO', // Pasa a almacén como recibido
          montoFinal: cotizacionGanadora.monto,
          proveedorFinal: cotizacionGanadora.proveedor,
          fechaFinalizado: new Date(),
        }
      });
    });
  }

  async notificarFaltaPresupuesto(solicitudId: number, motivo: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.mensaje.create({
        data: {
          solicitudId,
          motivo,
          fecha: new Date()
        }
      });

      return tx.solicitud.update({
        where: { id: solicitudId },
        data: {
          status: 'PENDIENTE_AJUSTE'
          // IMPORTANTE: No tocamos 'prioridad', así el color no se reinicia
        }
      });
    });
  }
}
