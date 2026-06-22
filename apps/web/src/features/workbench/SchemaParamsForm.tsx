import { Form, Input, InputNumber, Select } from 'antd';
import type { z } from 'zod';

import { getSchemaFields } from '../../lib/schema-fields';

interface Props {
  schema: z.AnyZodObject;
  value: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange: (name: string, value: unknown) => void;
}

// Renders an editable form purely from the Zod schema's shape (PRD §9.5). No
// per-action field is hardcoded here; adding a new action type's fields is just
// a schema change in shared.
export function SchemaParamsForm({ schema, value, errors, onChange }: Props) {
  const fields = getSchemaFields(schema);

  return (
    <Form layout="vertical" component="div">
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.name}
          required={!field.optional}
          validateStatus={errors?.[field.name] ? 'error' : undefined}
          help={errors?.[field.name]}
          style={{ marginBottom: 12 }}
        >
          {field.kind === 'enum' ? (
            <Select
              value={value[field.name] as string | undefined}
              options={(field.options ?? []).map((option) => ({ value: option, label: option }))}
              onChange={(next) => onChange(field.name, next)}
              allowClear={field.optional}
              placeholder="请选择"
            />
          ) : field.kind === 'number' ? (
            <InputNumber
              style={{ width: '100%' }}
              value={value[field.name] as number | undefined}
              min={field.min}
              max={field.max}
              precision={field.int ? 0 : undefined}
              onChange={(next) => onChange(field.name, next ?? undefined)}
            />
          ) : (
            <Input
              value={value[field.name] as string | undefined}
              onChange={(event) => onChange(field.name, event.target.value || undefined)}
            />
          )}
        </Form.Item>
      ))}
    </Form>
  );
}
