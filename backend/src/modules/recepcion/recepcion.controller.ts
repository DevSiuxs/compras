import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RecepcionService } from './recepcion.service';
import { FinalizarRecepcionDto } from './dto/finalizar-recepcion.dto';

@Controller('recepcion')
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  @Get('pendientes')
  listar() {
    return this.recepcionService.listarPendientes();
  }

  @Post(':id/entregar')
  entregar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinalizarRecepcionDto
  ) {
    return this.recepcionService.registrarEntrega(id, dto);
  }
}
