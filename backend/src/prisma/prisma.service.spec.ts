// /backend/src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // ¡Esta es la importación clave!

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // El constructor es heredado de PrismaClient
  
  // Implementación de la interfaz OnModuleInit
  async onModuleInit() {
    await this.$connect();
  }

  // Implementación de la interfaz OnModuleDestroy
  async onModuleDestroy() {
    await this.$disconnect();
  }
}