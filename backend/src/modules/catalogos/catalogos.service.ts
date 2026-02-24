import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatalogosService {
  constructor(private prisma: PrismaService) {}

  async crearUnidad(nombre: string) {
    return this.prisma.unidad.create({ data: { nombre } });
  }

  async listarUnidades() {
    return this.prisma.unidad.findMany({ orderBy: { nombre: 'asc' } });
  }

  async eliminarUnidad(id: number) {
    return this.prisma.unidad.delete({ where: { id } });
  }

  async crearEmpresa(nombre: string) {
    return this.prisma.empresa.create({ data: { nombre } });
  }

  async listarEmpresas() {
    return this.prisma.empresa.findMany({ orderBy: { nombre: 'asc' } });
  }

  async eliminarEmpresa(id: number) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
