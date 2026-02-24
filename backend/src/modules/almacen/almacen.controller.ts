import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
// AGREGA ESTA LÍNEA (Ajusta la ruta si es necesario)
import { ProcesarSolicitudDto } from './dto/procesar-solicitud.dto';

@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  @Get('pendientes')
  listar() {
    return this.almacenService.listarPendientes();
  }

  @Patch(':id/procesar')
  // Ahora TypeScript ya reconocerá qué es ProcesarSolicitudDto
  procesar(@Param('id') id: string, @Body() dto: ProcesarSolicitudDto) {
    return this.almacenService.procesarSolicitud(+id, dto.decision);
  }
}
