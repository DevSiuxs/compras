import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { AutorizarService } from './autorizacion.service';
import { DecidirCotizacionDto } from './dto/decidir-cotizacion.dto';
import { ActualizarPresupuestoDto } from './dto/actualizar-presupuesto.dto';

@Controller('autorizacion')
export class AutorizarController {
  constructor(private readonly autorizarService: AutorizarService) {}

  @Get('pendientes')
  listar() {
    return this.autorizarService.listarPendientes();
  }

  @Post(':id/decidir')
  decidir(@Param('id') id: string, @Body() dto: DecidirCotizacionDto) {
    return this.autorizarService.autorizarPropuesta(+id, dto);
  }

  @Get('presupuesto')
  verPresupuesto() {
    return this.autorizarService.obtenerPresupuesto();
  }

  @Patch('presupuesto')
  ajustarPresupuesto(@Body() dto: ActualizarPresupuestoDto) {
    return this.autorizarService.actualizarPresupuesto(dto.monto);
  }
}
