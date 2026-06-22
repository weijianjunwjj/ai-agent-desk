// Zod-schema introspection for the schema-driven parameter form (PRD §9.5):
// the editing form is rendered from TOOL_ACTION_PARAMS_SCHEMAS[type], NOT from
// hardcoded per-action fields. Reads zod v3 internals (_def.typeName) — stable
// in zod 3 (one reason we pinned v3; zod 4 reworked these internals).
import type { z } from 'zod';

export type SchemaFieldKind = 'number' | 'string' | 'enum';

export interface SchemaField {
  name: string;
  kind: SchemaFieldKind;
  optional: boolean;
  options?: string[];
  min?: number;
  max?: number;
  int?: boolean;
}

interface ZodCheckLike {
  kind: string;
  value?: number;
}

interface ZodDefLike {
  typeName: string;
  innerType?: z.ZodTypeAny;
  values?: string[];
  checks?: ZodCheckLike[];
}

function defOf(schema: z.ZodTypeAny): ZodDefLike {
  return (schema as unknown as { _def: ZodDefLike })._def;
}

function describeField(name: string, schema: z.ZodTypeAny): SchemaField {
  let optional = false;
  let current = schema;
  let def = defOf(current);

  // Unwrap optional / nullable / default wrappers to reach the base type.
  while (
    def.typeName === 'ZodOptional' ||
    def.typeName === 'ZodNullable' ||
    def.typeName === 'ZodDefault'
  ) {
    if (def.typeName !== 'ZodDefault') {
      optional = true;
    }
    current = def.innerType as z.ZodTypeAny;
    def = defOf(current);
  }

  if (def.typeName === 'ZodEnum') {
    return { name, kind: 'enum', optional, options: def.values ?? [] };
  }
  if (def.typeName === 'ZodNumber') {
    const checks = def.checks ?? [];
    return {
      name,
      kind: 'number',
      optional,
      min: checks.find((c) => c.kind === 'min')?.value,
      max: checks.find((c) => c.kind === 'max')?.value,
      int: checks.some((c) => c.kind === 'int'),
    };
  }
  return { name, kind: 'string', optional };
}

export function getSchemaFields(schema: z.AnyZodObject): SchemaField[] {
  return Object.entries(schema.shape).map(([name, raw]) =>
    describeField(name, raw as z.ZodTypeAny),
  );
}
