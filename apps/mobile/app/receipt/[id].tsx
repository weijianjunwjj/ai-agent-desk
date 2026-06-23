import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DECISION_LABELS } from '../../src/lib/labels';
import { formatDateTime } from '../../src/lib/format';
import { useApprovalStore } from '../../src/store/approval-store';

// Screen 3 — 状态回执 (PRD §8.4): result / final params / time / sync status /
// back entry.
export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;
  const router = useRouter();

  const detail = useApprovalStore((s) => (taskId ? s.details[taskId] : undefined));
  const result = useApprovalStore((s) => (taskId ? s.results[taskId] : undefined));

  if (!detail || !result) {
    return (
      <View style={styles.center}>
        <Text>暂无回执</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.resultBadge}>{DECISION_LABELS[result.decision]}</Text>
      <Text style={styles.title}>{detail.task.actionTitle}</Text>

      <Row label="审批结果" value={DECISION_LABELS[result.decision]} />
      <Row label="最终状态" value={result.finalStatus} />
      <View style={styles.block}>
        <Text style={styles.label}>最终参数</Text>
        {result.finalParams ? (
          Object.entries(result.finalParams).map(([key, value]) => (
            <Text key={key} style={styles.value}>
              {key}: {String(value)}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>—</Text>
        )}
      </View>
      <Row label="操作时间" value={formatDateTime(result.handledAt)} />
      <Row label="同步状态" value={result.syncStatus} />

      <Pressable
        style={styles.button}
        onPress={() => router.replace({ pathname: '/' })}
      >
        <Text style={styles.buttonText}>返回待审批列表</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  resultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
    fontWeight: '600',
  },
  title: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  block: { marginTop: 16 },
  label: { fontSize: 13, color: '#999', marginBottom: 4 },
  value: { fontSize: 15, color: '#333' },
  button: {
    marginTop: 28,
    backgroundColor: '#1677ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
