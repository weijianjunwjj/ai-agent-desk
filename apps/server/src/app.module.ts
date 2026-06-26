import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

// M1 skeleton: persistence (PrismaModule) + a liveness endpoint (HealthModule).
// Business modules (LLM gateway / approvals / execution) land in M2–M4.
@Module({
  imports: [PrismaModule, HealthModule],
})
export class AppModule {}
