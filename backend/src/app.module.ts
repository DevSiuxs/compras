import { Module } from '@nestjs/common';
import { CatalogosModule } from './modules/catalogos/catalogos.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { PrismaService } from './prisma/prisma.service';
import { AlmacenModule } from './modules/almacen/almacen.module';
import { CotizacionModule } from './modules/cotizacion/cotizacion.module';

import { AutorizarModule } from './modules/autorizacion/autorizacion.module';
import { ComprasModule } from './modules/compras/compras.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    CatalogosModule,
    SolicitudesModule,
    AlmacenModule,
    CotizacionModule,
    AutorizarModule,
    ComprasModule,
    ReportesModule // <--- TAMBIÉN AQUÍ
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
