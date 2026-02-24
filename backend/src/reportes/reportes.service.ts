import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async obtenerDashboardAdmin(fechaInicio?: string, fechaFin?: string) {
    const filtroFecha = fechaInicio && fechaFin ? {
      fechaCreacion: { gte: new Date(fechaInicio), lte: new Date(fechaFin) }
    } : {};

    const todas = await this.prisma.solicitud.findMany({
      where: filtroFecha,
      include: {
        empresa: true,
        cotizaciones: true,
        mensajes: true,
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    const config = await this.prisma.configuracionGlobal.findFirst();

    const porStatus = todas.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pagadas = todas.filter(s => s.status === 'PAGADO' || s.status === 'COMPRADO');
    const gastoTotal = pagadas.reduce((acc, s) => acc + (s.montoFinal || 0), 0);

    const gastosPorDia = pagadas.reduce((acc, s) => {
      const fecha = s.fechaFinalizado?.toLocaleDateString() || 'S/F';
      acc[fecha] = (acc[fecha] || 0) + (s.montoFinal || 0);
      return acc;
    }, {} as Record<string, number>);

    const gastosHistorial = Object.entries(gastosPorDia).map(([fecha, monto]) => ({
      fecha,
      monto
    }));

    return {
      stats: {
        presupuestoDisponible: config?.presupuestoGlobal || 0,
        gastoTotal,
        totalTickets: todas.length,
      },
      porStatus,
      solicitudes: todas,
      gastosHistorial: gastosHistorial.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    };
  }

  async obtenerDetalleLineaTiempo(id: number) {
    // CORRECCIÓN: Se asegura que el objeto devuelto incluya las relaciones para que TS no de error
    const sol = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        empresa: true,
        cotizaciones: true, // Se eliminó el orderBy problemático si Prisma no lo detecta aún
        mensajes: true
      }
    });

    if (!sol) throw new NotFoundException(`Solicitud ${id} no encontrada`);

    const eventos: any[] = [
      {
        fecha: sol.fechaCreacion,
        evento: 'SOLICITUD',
        detalle: `Creada para ${sol.empresa.nombre}.`,
        color: '#0070f3'
      }
    ];

    // Acceso seguro a relaciones
    sol.cotizaciones?.forEach((c: any) => {
      eventos.push({
        fecha: c.createdAt || new Date(), // Fallback por si la migración no ha corrido
        evento: 'COTIZACIÓN',
        detalle: `Proveedor: ${c.proveedor} - $${c.monto.toLocaleString()}`,
        color: c.seleccionada ? '#00ff41' : '#444'
      });
    });

    sol.mensajes?.forEach((m: any) => {
      eventos.push({
        fecha: m.createdAt || new Date(),
        evento: 'OBSERVACIÓN',
        detalle: m.motivo,
        color: '#ff9800'
      });
    });

    if (sol.fechaFinalizado) {
      eventos.push({
        fecha: sol.fechaFinalizado,
        evento: 'CIERRE',
        detalle: `Pagado a ${sol.proveedorFinal} por $${sol.montoFinal?.toLocaleString()}`,
        color: '#00ff41'
      });
    }

    const timeline = eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return { ...sol, timeline };
  }
}
