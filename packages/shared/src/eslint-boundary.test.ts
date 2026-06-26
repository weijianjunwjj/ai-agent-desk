// Counter-example test (v0.2 M1 DoD): proves the shared "no Node built-ins"
// red line is actually wired in eslint.config.mjs — not just intended. We run
// ESLint programmatically on virtual source placed under packages/shared/ and
// assert `no-restricted-imports` fires. If someone weakens the rule, this test
// goes red. (process.cwd() is a global, not a banned `import 'process'`.)
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// vitest runs with cwd = packages/shared (pnpm -r test), so this resolves to a
// path under packages/shared/** and picks up the shared override block.
const fixturePath = `${process.cwd()}/src/__node_builtin_fixture__.ts`;

async function lintShared(code: string) {
  const eslint = new ESLint();
  const [result] = await eslint.lintText(code, { filePath: fixturePath });
  return result.messages;
}

describe('shared Node-builtin red line (eslint.config.mjs)', () => {
  it('flags `import ... from "node:fs"` under packages/shared', async () => {
    const messages = await lintShared("import fs from 'node:fs';\nexport const x = fs;\n");
    expect(messages.some((m) => m.ruleId === 'no-restricted-imports')).toBe(true);
  });

  it('flags a bare core specifier like "path"', async () => {
    const messages = await lintShared("import path from 'path';\nexport const y = path;\n");
    expect(messages.some((m) => m.ruleId === 'no-restricted-imports')).toBe(true);
  });

  it('does NOT flag a clean shared import (zod)', async () => {
    const messages = await lintShared("import { z } from 'zod';\nexport const s = z.string();\n");
    expect(messages.some((m) => m.ruleId === 'no-restricted-imports')).toBe(false);
  });
});
