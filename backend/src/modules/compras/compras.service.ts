import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  // 1. Validar y comprar// compras.service.ts modificado

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
    // 1. Restar dinero del presupuesto global
    await tx.configuracionGlobal.update({
      where: { id: config.id },
      data: { presupuestoGlobal: { decrement: cotizacionGanadora.monto } }
    });

    // 2. Finalizar la solicitud guardando los datos para el DASHBOARD
    return tx.solicitud.update({
      where: { id: solicitudId },
      data: {
        status: 'PAGADO', // Cambiamos el status final
        montoFinal: cotizacionGanadora.monto, // Guardamos cuánto costó
        proveedorFinal: cotizacionGanadora.proveedor, // Quién lo vendió
        fechaFinalizado: new Date(), // Fecha exacta del cierre
      }
    });
  });
}

  // 2. Enviar mensaje por falta de presupuesto
  async notificarFaltaPresupuesto(solicitudId: number, motivo: string) {
    return this.prisma.$transaction(async (tx) => {
      // Creamos el registro en la nueva tabla Mensaje
      await tx.mensaje.create({
        data: {
          solicitudId,
          motivo,
          leido: false
        }
      });

      // Cambiamos el status para que Autorizar lo vea como "Pendiente"
      return tx.solicitud.update({
        where: { id: solicitudId },
        data: { status: 'PENDIENTE_AJUSTE' }
      });
    });
  }
  // ... dentro de la clase ComprasService

async listarPendientes() {
  return this.prisma.solicitud.findMany({
    where: {
      status: {
        in: ['COMPRAR', 'PENDIENTE_AJUSTE'] // Trae las autorizadas y las que rebotaron por falta de saldo
      }
    },
    include: {
      empresa: true,
      items: { include: { unidad: true } },
      cotizaciones: {
        where: { seleccionada: true } // Solo nos interesa ver la que el jefe eligió
      },
      mensajes: {
        orderBy: { fecha: 'desc' } // Traer los mensajes para ver el historial de por qué no se ha comprado
      }
    },
    orderBy: {
      fechaResetColor: 'asc' // Prioridad por la fecha de semáforo más vieja
    }
  });
}
}
