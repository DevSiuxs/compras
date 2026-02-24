import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionesDto } from './dto/create-cotizaciones.dto';

@Controller('cotizacion')
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

  @Get('pendientes')
  listar() {
    return this.cotizacionService.listarPendientes();
  }

  @Post(':id/registrar')
  registrar(@Param('id') id: string, @Body() dto: CreateCotizacionesDto) {
    return this.cotizacionService.registrar(+id, dto);
  }
}
