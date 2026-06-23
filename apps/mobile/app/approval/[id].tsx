import { approvalMachine, TOOL_ACTION_PARAMS_SCHEMAS } from '@ai-agent-desk/shared';
import { useMachine } from '@xstate/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParamsEditor } from '../../src/components/ParamsEditor';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, TOOL_ACTION_TYPE_LABELS } from '../../src/lib/labels';
import { useApprovalStore } from '../../src/store/approval-store';

type PendingDecision = 'approved' | 'edited_approved';

// Screen 2 — 审批详情 (PRD §8.3). RN decisions map onto the SHARED approvalMachine
// (PRD §5.2): 同意=APPROVE, 拒绝=REJECT, 修改后同意=EDIT→SAVE→APPROVE, 稍后处理=delayed.
export default function ApprovalDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;
  const router = useRouter();

  const detail = useApprovalStore((s) => (taskId ? s.details[taskId] : undefined));
  const recordResult = useApprovalStore((s) => s.recordResult);
  const markDelayed = useApprovalStore((s) => s.markDelayed);

  const [state, send] = useMachine(approvalMachine);
  const status = String(state.value);

  const [editing, setEditing] = useState(false);
  const [actionParams, setActionParams] = useState<Record<string, unknown>>({});
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>('approved');

  useEffect(() => {
    if (detail) {
      setActionParams({ ...detail.action.params });
      setDraft({ ...detail.action.params });
    }
  }, [detail]);

  // executing → success → record result → receipt (mirrors Web; RN demo path
  // is the success branch, PRD §15.1).
  useEffect(() => {
    if (status !== 'executing' || !taskId) return;
    const timer = setTimeout(() => {
      send({ type: 'RESOLVE_SUCCESS' });
      recordResult(taskId, {
        decision: pendingDecision,
        finalStatus: 'success',
        finalParams: actionParams,
        handledAt: new Date().toISOString(),
        syncStatus: '已同步至 Web（含 rn_action_approved 留痕）',
      });
      router.replace({ pathname: '/receipt/[id]', params: { id: taskId } });
    }, 700);
    return () => clearTimeout(timer);
  }, [status]);

  if (!detail || !taskId) {
    return (
      <View style={styles.center}>
        <Text>未找到审批任务</Text>
      </View>
    );
  }

  const { action } = detail;
  const schema = TOOL_ACTION_PARAMS_SCHEMAS[action.type];
  const busy = status === 'executing';

  const handleApprove = () => {
    setPendingDecision('approved');
    send({ type: 'APPROVE' });
  };

  const handleReject = () => {
    send({ type: 'REJECT' });
    recordResult(taskId, {
      decision: 'rejected',
      finalStatus: 'rejected',
      handledAt: new Date().toISOString(),
      syncStatus: '已同步至 Web（含 rn_action_rejected 留痕）',
    });
    router.replace({ pathname: '/receipt/[id]', params: { id: taskId } });
  };

  const handleStartEdit = () => {
    setDraft({ ...actionParams });
    setErrors({});
    setEditing(true);
  };

  const handleSubmitEdited = () => {
    const result = schema.safeParse(draft);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }
    setActionParams({ ...(result.data as Record<string, unknown>) });
    setErrors({});
    setEditing(false);
    setPendingDecision('edited_approved');
    // RN 修改后同意 → 复用现有转移（PRD §5.2）：EDIT → SAVE → APPROVE
    send({ type: 'EDIT' });
    send({ type: 'SAVE' });
    send({ type: 'APPROVE' });
  };

  const handleDelay = () => {
    markDelayed(taskId);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{action.title}</Text>
        <View style={[styles.riskTag, { backgroundColor: RISK_LEVEL_COLORS[action.riskLevel] }]}>
          <Text style={styles.riskTagText}>{RISK_LEVEL_LABELS[action.riskLevel]}</Text>
        </View>
      </View>
      <Text style={styles.typeLabel}>{TOOL_ACTION_TYPE_LABELS[action.type]}</Text>

      <Text style={styles.sectionLabel}>AI 建议理由</Text>
      <Text style={styles.body}>{action.reason}</Text>

      <Text style={styles.sectionLabel}>客户摘要</Text>
      <Text style={styles.body}>{detail.customerSummary}</Text>

      <Text style={styles.sectionLabel}>最近消息</Text>
      <Text style={styles.body}>{detail.lastMessage}</Text>

      <Text style={styles.sectionLabel}>动作参数</Text>
      {editing ? (
        <ParamsEditor
          schema={schema}
          value={draft}
          errors={errors}
          onChange={(name, value) => setDraft((prev) => ({ ...prev, [name]: value }))}
        />
      ) : (
        Object.entries(actionParams).map(([key, value]) => (
          <Text key={key} style={styles.param}>
            {key}: {String(value)}
          </Text>
        ))
      )}

      {busy ? <Text style={styles.busy}>处理中…</Text> : null}

      <View style={styles.actions}>
        {editing ? (
          <>
            <Button testID="btn-submit-edit" label="提交（修改后同意）" kind="primary" onPress={handleSubmitEdited} />
            <Button testID="btn-cancel-edit" label="取消修改" onPress={() => setEditing(false)} />
          </>
        ) : (
          <>
            <Button testID="btn-approve" label="同意" kind="primary" disabled={busy} onPress={handleApprove} />
            <Button testID="btn-edit-approve" label="修改后同意" disabled={busy} onPress={handleStartEdit} />
            <Button testID="btn-reject" label="拒绝" kind="danger" disabled={busy} onPress={handleReject} />
            <Button testID="btn-delay" label="稍后处理" disabled={busy} onPress={handleDelay} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Button({
  label,
  kind = 'default',
  disabled,
  onPress,
  testID,
}: {
  label: string;
  kind?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const background = kind === 'primary' ? '#1677ff' : kind === 'danger' ? '#fff1f0' : '#fff';
  const color = kind === 'primary' ? '#fff' : kind === 'danger' ? '#f5222d' : '#333';
  const borderColor = kind === 'primary' ? '#1677ff' : kind === 'danger' ? '#ffa39e' : '#d9d9d9';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: background, borderColor }, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
  typeLabel: { color: '#1677ff', marginTop: 4 },
  sectionLabel: { fontSize: 13, color: '#999', marginTop: 16, marginBottom: 4 },
  body: { fontSize: 15, color: '#333', lineHeight: 22 },
  param: { fontSize: 15, color: '#333', marginTop: 2 },
  busy: { marginTop: 16, color: '#fa8c16' },
  riskTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  riskTagText: { color: '#fff', fontSize: 12 },
  actions: { marginTop: 24, gap: 10 },
  button: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontWeight: '500' },
});
