import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Thin wrapper so the rest of the app injects PrismaService and the connection
// lifecycle is tied to the Nest module lifecycle. Business reads/writes (with
// shared-Zod validation at the boundary) arrive in M3/M4.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
