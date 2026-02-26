import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  // EMPRESAS
  @Post('empresas')
  crearEmpresa(@Body('nombre') nombre: string) {
    return this.catalogosService.crearEmpresa(nombre);
  }
  @Get('empresas')
  listar() { return this.catalogosService.listarEmpresas(); }

  @Delete('empresas/:id')
  eliminarE(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarEmpresa(id);
  }

  // UNIDADES
  @Post('unidades')
  crearUnidad(@Body('nombre') nombre: string) {
    return this.catalogosService.crearUnidad(nombre);
  }
  @Get('unidades')
  listarU() { return this.catalogosService.listarUnidades(); }

  @Delete('unidades/:id')
  eliminarU(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarUnidad(id);
  }

  // ÁREAS
  @Post('areas')
  crearArea(@Body('nombre') nombre: string) {
    return this.catalogosService.crearArea(nombre);
  }
  @Get('areas')
  listarA() { return this.catalogosService.listarAreas(); }

  @Delete('areas/:id')
  eliminarA(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.eliminarArea(id);
  }
}
