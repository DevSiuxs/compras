import { Controller, Get, Post, Body } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto'; // Importalo

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  crear(@Body() data: CreateSolicitudDto) { // Usa el DTO aquí
    return this.solicitudesService.crear(data);
  }

  @Get()
  listar() {
    return this.solicitudesService.listarTodas();
  }
}
