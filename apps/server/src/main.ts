// NestJS entry. reflect-metadata MUST be imported before any decorator is
// evaluated (NestJS DI relies on emitted decorator metadata).
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
// Consuming shared's raw TS source from the server (the 3rd consumer of the
// single source of truth) — same approval-routing policy, no parallel rule.
import { MOBILE_APPROVAL_RISK_THRESHOLD } from '@ai-agent-desk/shared';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(
    `[server] AI Agent Desk server listening on http://localhost:${port} ` +
      `(mobile-approval threshold from shared: ${MOBILE_APPROVAL_RISK_THRESHOLD})`,
  );
}

void bootstrap();
