import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FinalizarRecepcionDto } from './dto/finalizar-recepcion.dto';

@Injectable()
export class RecepcionService {
  constructor(private prisma: PrismaService) {}

  // Listar lo que viene de COMPRAS
  async listarPendientes() {
    return this.prisma.solicitud.findMany({
      where: { status: 'RECIBIDO' },
      include: { empresa: true, area: true, items: { include: { unidad: true } } },
      orderBy: { fechaFinalizado: 'asc' }
    });
  }

  // MÉTODO CLAVE: Finaliza el proceso (Status ENTREGADO)
  async registrarEntrega(id: number, dto: FinalizarRecepcionDto) {
    const existe = await this.prisma.solicitud.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Solicitud no encontrada');

    return this.prisma.solicitud.update({
      where: { id },
      data: {
        nombreRecibe: dto.nombre,
        apellidoPRecibe: dto.apellidoPaterno,
        apellidoMRecibe: dto.apellidoMaterno,
        status: 'ENTREGADO', // Status final
        fechaRecepcion: new Date()
      }
    });
  }
}
