// Contract test (v0.2 M1 DoD): the Prisma columns are hand-written, so they can
// drift from the shared schemas they are supposed to mirror. This test parses
// prisma/schema.prisma and asserts each model's column set EQUALS the key set of
// the corresponding shared Zod schema. If shared adds/renames a field and the
// Prisma model isn't updated (or vice versa), this goes red — no silent drift.
//
// Unlike packages/shared, the server is allowed Node built-ins, so reading the
// schema file here is fine.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TimelineEventSchema, ToolActionSchema } from '@ai-agent-desk/shared';
import { describe, expect, it } from 'vitest';

// vitest runs with cwd = apps/server, so the schema resolves relative to it.
const schemaText = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');

function parseModelFields(modelName: string): string[] {
  const block = schemaText.match(new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!block) throw new Error(`model ${modelName} not found in schema.prisma`);
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('@@'))
    .map((line) => line.split(/\s+/)[0]);
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

describe('Prisma schema ↔ shared Zod alignment (v0.2 §0: no parallel rules)', () => {
  it('ToolAction columns match the shared ToolAction discriminated-union keys', () => {
    // Every union variant shares the same key set; option[0] is representative.
    const sharedKeys = sortedUnique(Object.keys(ToolActionSchema.options[0].shape));
    const prismaFields = sortedUnique(parseModelFields('ToolAction'));
    expect(prismaFields).toEqual(sharedKeys);
  });

  it('TimelineEvent columns match the shared TimelineEvent schema keys', () => {
    const sharedKeys = sortedUnique(Object.keys(TimelineEventSchema.shape));
    const prismaFields = sortedUnique(parseModelFields('TimelineEvent'));
    expect(prismaFields).toEqual(sharedKeys);
  });
});
