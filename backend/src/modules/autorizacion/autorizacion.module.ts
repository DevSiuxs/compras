import { Module } from '@nestjs/common';
import { AutorizarService } from './autorizacion.service';
import { AutorizarController } from './autorizacion.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AutorizarController],
  providers: [AutorizarService, PrismaService],
})
export class AutorizarModule {}
