import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCotizacionesDto } from './dto/create-cotizaciones.dto';

@Injectable()
export class CotizacionService {
  constructor(private prisma: PrismaService) {}

  // Listar solicitudes que están esperando cotización
  async listarPendientes() {
    return this.prisma.solicitud.findMany({
      where: { status: 'COTIZANDO' },
      include: {
        empresa: true,
        items: { include: { unidad: true } }
      }
    });
  }

  // Registrar las 2 cotizaciones con los 4 campos cada una
  async registrar(id: number, dto: CreateCotizacionesDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear las 2 cotizaciones en la base de datos
      await tx.cotizacion.createMany({
        data: [
          {
            proveedor: dto.c1_proveedor,
            monto: Number(dto.c1_monto),
            quienCotizo: dto.c1_quien,
            observaciones: dto.c1_observaciones,
            solicitudId: id
          },
          {
            proveedor: dto.c2_proveedor,
            monto: Number(dto.c2_monto),
            quienCotizo: dto.c2_quien,
            observaciones: dto.c2_observaciones,
            solicitudId: id
          }
        ]
      });

      // 2. Actualizar la solicitud: Status nuevo, reset de color y prioridad azul
      return tx.solicitud.update({
        where: { id: id },
        data: {
          status: 'AUTORIZAR',
          fechaResetColor: new Date(),
          prioridad: 'AZUL'
        }
      });
    });
  }
}
