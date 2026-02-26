// src/modules/solicitudes/solicitudes.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: CreateSolicitudDto) {
    // 1. Obtener la fecha actual (Hoy)
    const hoy = new Date();
    const inicioDia = new Date(hoy.setHours(0, 0, 0, 0));
    const finDia = new Date(hoy.setHours(23, 59, 59, 999));

    // 2. Contar cuántas solicitudes se han hecho SOLO HOY para reiniciar el contador
    const totalHoy = await this.prisma.solicitud.count({
      where: {
        fechaCreacion: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    // 3. Formatear Día y Mes (ej: 2502 para 25 de Febrero)
    const dia = String(new Date().getDate()).padStart(2, '0');
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');

    // 4. Generar Folio: SOL-DiaMes-Contador(4 digitos para que no sea excesivo)
    // Ejemplo: SOL-2502-0001
    const nuevoNumero = (totalHoy + 1).toString().padStart(4, '0');
    const folio = `SOL-${dia}${mes}-${nuevoNumero}`;

    return this.prisma.solicitud.create({
      data: {
        folio,
        justificacion: datos.justificacion,
        idEmpresa: Number(datos.idEmpresa),
        idArea: Number(datos.idArea),
        status: 'SOLICITADO',
        prioridad: 'AZUL',
        fechaResetColor: new Date(),
        items: {
          create: datos.items.map((item) => ({
            descripcion: item.descripcion,
            cantidad: Number(item.cantidad),
            idUnidad: Number(item.idUnidad),
          })),
        },
      },
      include: {
        items: true,
        empresa: true,
        area: true
      }
    });
  }

  async listarTodas() {
    return this.prisma.solicitud.findMany({
      include: {
        empresa: true,
        area: true,
        items: { include: { unidad: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
  }
}
