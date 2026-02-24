import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva solicitud con folios automáticos y conversión de tipos
   */
  async crear(data: any) {
    // 1. Generar Folio Automático (Ej: SOL-2024-001)
    const conteo = await this.prisma.solicitud.count();
    const año = new Date().getFullYear();
    const folio = `SOL-${año}-${(conteo + 1).toString().padStart(3, '0')}`;

    // 2. Crear registro en la base de datos
    return this.prisma.solicitud.create({
      data: {
        folio: folio,
        justificacion: data.justificacion,
        // El campo 'area' es texto libre como solicitaste
        area: data.area,
        // Aseguramos que el idEmpresa sea tratado como número por Prisma
        idEmpresa: Number(data.idEmpresa),
        status: 'SOLICITADO',
        prioridad: 'AZUL',
        fechaResetColor: new Date(),
        // Creación anidada de los ítems de la solicitud
        items: {
          create: data.items.map((item: any) => ({
            descripcion: item.descripcion,
            cantidad: Number(item.cantidad),
            idUnidad: Number(item.idUnidad),
          })),
        },
      },
      include: {
        items: true, // Incluye los ítems creados en la respuesta
      },
    });
  }

  /**
   * Lista todas las solicitudes con la información de empresa y unidades
   */
  async listarTodas() {
    return this.prisma.solicitud.findMany({
      include: {
        empresa: true, // Trae el nombre de la empresa asociada
        items: {
          include: {
            unidad: true // Trae el nombre de la unidad (Pza, Kg, etc.)
          }
        }
      },
      orderBy: {
        id: 'desc' // Las más recientes primero
      }
    });
  }
}
