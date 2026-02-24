import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ComprasService } from './compras.service';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get('pendientes')
  listarPendientes() {
    return this.comprasService.listarPendientes();
  }

  @Post(':id/ejecutar')
  comprar(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.ejecutarCompra(id);
  }

  @Post(':id/notificar-presupuesto')
  notificar(@Param('id', ParseIntPipe) id: number, @Body('motivo') motivo: string) {
    return this.comprasService.notificarFaltaPresupuesto(id, motivo);
  }
}
