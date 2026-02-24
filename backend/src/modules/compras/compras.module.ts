import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ComprasController],
  providers: [ComprasService, PrismaService],
})
export class ComprasModule {}
