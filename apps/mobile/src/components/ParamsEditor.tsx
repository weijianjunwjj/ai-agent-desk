import { getSchemaFields } from '@ai-agent-desk/shared';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { z } from 'zod';

interface Props {
  schema: z.AnyZodObject;
  value: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange: (name: string, value: unknown) => void;
}

// Native (RN) schema-driven editor (PRD §8.3): fields come from the shared Zod
// introspection — same source as the Web AntD form — rendered with plain RN
// components. Validation on submit uses the same per-type Zod schema.
export function ParamsEditor({ schema, value, errors, onChange }: Props) {
  const fields = getSchemaFields(schema);

  return (
    <View>
      {fields.map((field) => (
        <View key={field.name} style={styles.field}>
          <Text style={styles.label}>
            {field.name}
            {field.optional ? '' : ' *'}
          </Text>

          {field.kind === 'enum' ? (
            <View style={styles.options}>
              {(field.options ?? []).map((option) => {
                const active = value[field.name] === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => onChange(field.name, option)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={active ? styles.chipTextActive : styles.chipText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              keyboardType={field.kind === 'number' ? 'numeric' : 'default'}
              value={value[field.name] == null ? '' : String(value[field.name])}
              onChangeText={(text) =>
                onChange(
                  field.name,
                  field.kind === 'number'
                    ? text === ''
                      ? undefined
                      : Number(text)
                    : text === ''
                      ? undefined
                      : text,
                )
              }
            />
          )}

          {errors?.[field.name] ? <Text style={styles.error}>{errors[field.name]}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#1677ff', borderColor: '#1677ff' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  error: { color: '#f5222d', fontSize: 12, marginTop: 4 },
});
