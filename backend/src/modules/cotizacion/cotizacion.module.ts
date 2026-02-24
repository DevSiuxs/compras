import { Module } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CotizacionController } from './cotizacion.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CotizacionController],
  providers: [CotizacionService, PrismaService],
})
export class CotizacionModule {}
