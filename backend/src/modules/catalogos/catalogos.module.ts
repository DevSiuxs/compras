import { Module } from '@nestjs/common';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { PrismaService } from 'src/prisma/prisma.service'; // Asegúrate de tenerlo creado

@Module({
  controllers: [CatalogosController],
  providers: [CatalogosService, PrismaService],
})
export class CatalogosModule {}
