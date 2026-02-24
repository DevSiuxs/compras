import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard')
  getDashboard(@Query('inicio') inicio?: string, @Query('fin') fin?: string) {
    // Asegúrate de que el nombre aquí coincida con el del service
    return this.reportesService.obtenerDashboardAdmin(inicio, fin);
  }

  @Get('detalle/:id')
  getDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.obtenerDetalleLineaTiempo(id);
  }
}
