import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlmacenService {
  constructor(private prisma: PrismaService) {}

  // Listar solo lo que está pendiente de almacén
  async listarPendientes() {
    return this.prisma.solicitud.findMany({
      where: { status: 'SOLICITADO' },
      include: {
        empresa: true,
        items: { include: { unidad: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
  }

  // Cambiar status según la decisión del almacenista
  async procesarSolicitud(id: number, decision: 'surtir' | 'no-stock') {
    const nuevoStatus = decision === 'surtir' ? 'ENTREGADO' : 'COTIZANDO';

    return this.prisma.solicitud.update({
      where: { id: Number(id) },
      data: { status: nuevoStatus }
    });
  }
}
