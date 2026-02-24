import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Post('unidades')
  crearUnidad(@Body('nombre') nombre: string) {
    return this.catalogosService.crearUnidad(nombre);
  }

  @Get('unidades')
  listarUnidades() {
    return this.catalogosService.listarUnidades();
  }

  @Delete('unidades/:id')
  eliminarUnidad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarUnidad(id);
  }

  @Post('empresas')
  crearEmpresa(@Body('nombre') nombre: string) {
    return this.catalogosService.crearEmpresa(nombre);
  }

  @Get('empresas')
  listarEmpresas() {
    return this.catalogosService.listarEmpresas();
  }

  @Delete('empresas/:id')
  eliminarEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarEmpresa(id);
  }
}
