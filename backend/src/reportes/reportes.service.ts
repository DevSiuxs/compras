import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // 1. Método para el Dashboard (Acepta fechas opcionales para quitar el error TS2554)
  async obtenerDashboardAdmin(fechaInicio?: string, fechaFin?: string) {
    // Crear filtro de fecha si existen
    const filtro: any = {};
    if (fechaInicio && fechaFin) {
      filtro.fechaCreacion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    const todas = await this.prisma.solicitud.findMany({
      where: filtro,
      include: { empresa: true, cotizaciones: true }
    }) || [];

    const config = await this.prisma.configuracionGlobal.findFirst();

    // Conteo por secciones (Garantiza 0 si está vacío)
    const conteoSecciones = {
      ALMACEN: todas.filter(s => s.status === 'SOLICITADO').length || 0,
      COTIZANDO: todas.filter(s => s.status === 'COTIZANDO').length || 0,
      AUTORIZAR: todas.filter(s => s.status === 'AUTORIZAR').length || 0,
      COMPRAS: todas.filter(s => s.status === 'COMPRAR').length || 0,
      RECEPCION: todas.filter(s => s.status === 'RECIBIDO').length || 0,
      FINALIZADO: todas.filter(s => s.status === 'ENTREGADO').length || 0,
    };

    // Gasto total (Suma segura)
    const gastoTotal = todas.reduce((acc, s) => {
      const monto = s.montoFinal ? Number(s.montoFinal) : 0;
      return acc + monto;
    }, 0);

    // Datos para la gráfica (Array vacío si no hay nada)
    const graficoGastos = todas.length > 0
      ? todas.slice(0, 10).map(s => ({
          name: s.folio,
          gasto: Number(s.montoFinal) || 0
        }))
      : [];

    return {
      presupuestoRestante: config?.presupuestoGlobal || 0,
      gastoTotal: gastoTotal,
      totalTickets: todas.length || 0,
      conteoSecciones,
      graficoGastos,
      recientes: todas.slice(0, 5)
    };
  }

  // 2. Método de Detalle (Para corregir el error TS2339)
  async obtenerDetalleLineaTiempo(id: number) {
    const sol = await this.prisma.solicitud.findUnique({
      where: { id: Number(id) },
      include: {
        empresa: true,
        cotizaciones: true,
        mensajes: true
      }
    });

    if (!sol) throw new NotFoundException(`La solicitud con ID ${id} no existe`);

    // Construcción de la línea de tiempo
    const timeline: any[] = [
      {
        fecha: sol.fechaCreacion,
        evento: 'CREACIÓN',
        detalle: `Solicitud generada para ${sol.empresa?.nombre}`,
        color: '#0070f3'
      }
    ];

    // Agregar cotizaciones si existen
    sol.cotizaciones?.forEach(c => {
      timeline.push({
        fecha: c.createdAt || new Date(),
        evento: 'COTIZACIÓN',
        detalle: `Proveedor: ${c.proveedor} - $${c.monto.toLocaleString()}`,
        color: c.seleccionada ? '#00ff41' : '#444'
      });
    });

    // Agregar mensajes/observaciones
    sol.mensajes?.forEach(m => {
      timeline.push({
        fecha: m.fecha || new Date(),
        evento: 'OBSERVACIÓN',
        detalle: m.motivo,
        color: '#ffca28'
      });
    });

    if (sol.fechaFinalizado) {
      timeline.push({
        fecha: sol.fechaFinalizado,
        evento: 'COMPRA EJECUTADA',
        detalle: `Monto final: $${sol.montoFinal?.toLocaleString()}`,
        color: '#ff0080'
      });
    }

    return {
      folio: sol.folio,
      empresa: sol.empresa,
      status: sol.status,
      timeline: timeline.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    };
  }
}
