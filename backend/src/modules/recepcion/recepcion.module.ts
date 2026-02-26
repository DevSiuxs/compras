import { Module } from '@nestjs/common';
import { RecepcionService } from './recepcion.service';
import { RecepcionController } from './recepcion.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RecepcionController],
  providers: [RecepcionService, PrismaService],
})
export class RecepcionModule {}
