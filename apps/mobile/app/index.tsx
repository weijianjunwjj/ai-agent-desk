import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateTime } from '../src/lib/format';
import { DECISION_LABELS, RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../src/lib/labels';
import { sendApprovalPush } from '../src/notifications';
import type { TaskDetail } from '../src/mock/seed';
import { useApprovalStore } from '../src/store/approval-store';

// Screen 1 — 待审批列表 (PRD §8.2). FlashList over the mobile-routed ApprovalTasks.
export default function InboxScreen() {
  const router = useRouter();
  const load = useApprovalStore((s) => s.load);
  const order = useApprovalStore((s) => s.order);
  const details = useApprovalStore((s) => s.details);
  const results = useApprovalStore((s) => s.results);
  const pushedTaskIds = useApprovalStore((s) => s.pushedTaskIds);
  const markPushed = useApprovalStore((s) => s.markPushed);

  useEffect(() => {
    void load();
  }, [load]);

  const data = order.map((id) => details[id]);

  // Simulated push (PRD §8.5): on a device this fires a real local notification
  // (tap → detail via the listener in _layout). On web, no notification API, so
  // we navigate directly to stand in for the tap-through.
  const simulatePush = async (item: TaskDetail) => {
    markPushed(item.task.id);
    const delivered = await sendApprovalPush({
      taskId: item.task.id,
      customerName: item.customerName,
      actionTitle: item.task.actionTitle,
    });
    if (!delivered) {
      router.push({ pathname: '/approval/[id]', params: { id: item.task.id } });
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        keyExtractor={(item) => item.task.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const result = results[item.task.id];
          const pushed = pushedTaskIds.includes(item.task.id);
          return (
            <View style={styles.card}>
              <Pressable
                testID={`task-card-${item.task.id}`}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/approval/[id]', params: { id: item.task.id } })}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.customer}>{item.customerName}</Text>
                  <View style={[styles.riskTag, { backgroundColor: RISK_LEVEL_COLORS[item.task.riskLevel] }]}>
                    <Text style={styles.riskTagText}>{RISK_LEVEL_LABELS[item.task.riskLevel]}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{item.task.actionTitle}</Text>
                <Text style={styles.summary} numberOfLines={2}>
                  {item.customerSummary}
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.meta}>
                    {item.task.pushedAt ? formatDateTime(item.task.pushedAt) : ''}
                  </Text>
                  <Text style={styles.status}>
                    {result ? DECISION_LABELS[result.decision] : '待审批'}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                testID={`push-${item.task.id}`}
                accessibilityRole="button"
                style={styles.pushButton}
                onPress={() => {
                  void simulatePush(item);
                }}
              >
                <Text style={styles.pushButtonText}>
                  {pushed ? '🔔 已推送 · 点此进入审批' : '📲 模拟收到推送'}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>暂无待审批任务</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customer: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 15, color: '#1677ff', marginTop: 6 },
  summary: { fontSize: 13, color: '#888', marginTop: 6 },
  meta: { fontSize: 12, color: '#aaa', marginTop: 10 },
  status: { fontSize: 12, color: '#fa8c16', marginTop: 10 },
  riskTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  riskTagText: { color: '#fff', fontSize: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 48 },
  pushButton: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    alignItems: 'center',
  },
  pushButtonText: { color: '#1677ff', fontSize: 14, fontWeight: '500' },
});
