import type { ToolAction } from '@ai-agent-desk/shared';
import {
  approvalMachine,
  requiresMobileApproval,
  TOOL_ACTION_PARAMS_SCHEMAS,
} from '@ai-agent-desk/shared';
import { useMachine } from '@xstate/react';
import { Alert, App, Button, Card, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { useTimelineWriter } from '../../api/workbench-queries';
import { formatDateTime } from '../../lib/format';
import { getSchemaFields } from '../../lib/schema-fields';
import { createTimelineEvent } from '../../mock/timeline-store';
import { useWorkbenchStore } from '../../store/workbench-store';
import { SchemaParamsForm } from './SchemaParamsForm';
import { SuggestedActionPreview } from './SuggestedActionPreview';

const OPERATOR = '客服（Web）';

// ToolApprovalCard (PRD §9) — the load-bearing wall. One XState machine instance
// per ToolAction drives the status (§12.3); React state holds only presentation
// data (params draft, errors), never the lifecycle status.
export function ToolApprovalCard({ action }: { action: ToolAction }) {
  const [state, send] = useMachine(approvalMachine);
  const status = String(state.value);
  const { message } = App.useApp();
  const appendTimeline = useTimelineWriter();
  const forceFail = useWorkbenchStore((s) => s.forceNextExecutionFailure);
  const setForceFail = useWorkbenchStore((s) => s.setForceNextExecutionFailure);

  const onMobile = requiresMobileApproval(action.riskLevel);
  const schema = TOOL_ACTION_PARAMS_SCHEMAS[action.type];
  const originalParams = action.originalParams as Record<string, unknown>;

  const [params, setParams] = useState<Record<string, unknown>>({ ...action.params });
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...action.params });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [executedAt, setExecutedAt] = useState<string | null>(null);

  const paramsEdited = JSON.stringify(params) !== JSON.stringify(originalParams);

  const timeline = (event: Parameters<typeof createTimelineEvent>[0]) => appendTimeline(createTimelineEvent(event));

  // Mock execution runs when the machine enters `executing`. Outcome is
  // deterministic via the demo "force fail" switch (PRD §12.2), not random.
  useEffect(() => {
    if (status !== 'executing') return;
    const willFail = forceFail;
    const timer = setTimeout(() => {
      if (willFail) {
        const reason = '下游服务返回错误（演示强制失败）';
        setFailedReason(reason);
        setForceFail(false); // one-shot
        timeline({
          conversationId: action.conversationId,
          actionId: action.id,
          eventType: 'tool_action_failed',
          title: `执行失败：${action.title}`,
          description: reason,
          operatorType: 'system',
          operatorName: '系统',
        });
        send({ type: 'RESOLVE_FAILURE' });
      } else {
        const at = new Date().toISOString();
        setExecutedAt(at);
        timeline({
          conversationId: action.conversationId,
          actionId: action.id,
          eventType: 'tool_action_success',
          title: `执行成功：${action.title}`,
          description: '动作执行成功',
          operatorType: 'system',
          operatorName: '系统',
          afterSnapshot: { params },
        });
        send({ type: 'RESOLVE_SUCCESS' });
      }
    }, 800);
    return () => clearTimeout(timer);
    // Intentionally only re-run on status change (one execution per entry).

  }, [status]);

  const handleEdit = () => {
    setDraft({ ...params });
    setErrors({});
    send({ type: 'EDIT' });
  };

  const handleCancel = () => {
    setErrors({});
    send({ type: 'CANCEL' });
  };

  const handleSave = () => {
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
      return; // stay in editing (PRD §9.5)
    }
    const before = { ...params };
    const after = { ...(result.data as Record<string, unknown>) };
    setParams(after);
    setErrors({});
    timeline({
      conversationId: action.conversationId,
      actionId: action.id,
      eventType: 'tool_params_edited',
      title: `参数已修改：${action.title}`,
      description: '编辑草稿校验通过并写回参数',
      operatorType: 'human',
      operatorName: OPERATOR,
      beforeSnapshot: { params: before },
      afterSnapshot: { params: after },
    });
    message.success('参数已保存');
    send({ type: 'SAVE' });
  };

  const handleApprove = () => {
    timeline({
      conversationId: action.conversationId,
      actionId: action.id,
      eventType: 'tool_action_approved',
      title: `审批通过：${action.title}`,
      description: '人工确认执行',
      operatorType: 'human',
      operatorName: OPERATOR,
    });
    timeline({
      conversationId: action.conversationId,
      actionId: action.id,
      eventType: 'tool_action_executing',
      title: `开始执行：${action.title}`,
      description: '动作执行中',
      operatorType: 'system',
      operatorName: '系统',
    });
    send({ type: 'APPROVE' });
  };

  const handleReject = () => {
    timeline({
      conversationId: action.conversationId,
      actionId: action.id,
      eventType: 'tool_action_rejected',
      title: `审批拒绝：${action.title}`,
      description: '人工拒绝该动作',
      operatorType: 'human',
      operatorName: OPERATOR,
    });
    send({ type: 'REJECT' });
  };

  const handleRetry = () => {
    setFailedReason(null);
    send({ type: 'RETRY' });
  };

  const handleRollback = () => {
    timeline({
      conversationId: action.conversationId,
      actionId: action.id,
      eventType: 'tool_action_rollback',
      title: `已回滚：${action.title}`,
      description: '人工回滚动作',
      operatorType: 'human',
      operatorName: OPERATOR,
      beforeSnapshot: { params },
    });
    send({ type: 'ROLLBACK' });
  };

  // editing state: schema-driven form + diff (PRD §9.5)
  if (status === 'editing') {
    const diffRows = getSchemaFields(schema)
      .map((field) => field.name)
      .filter((name) => String(draft[name] ?? '') !== String(originalParams[name] ?? ''))
      .map((name) => ({ name, from: originalParams[name], to: draft[name] }));

    return (
      <Card size="small" type="inner" title={`编辑参数 · ${action.title}`} style={{ marginBottom: 12 }}>
        <SchemaParamsForm
          schema={schema}
          value={draft}
          errors={errors}
          onChange={(name, value) => setDraft((prev) => ({ ...prev, [name]: value }))}
        />
        <Typography.Text type="secondary">与 AI 原始参数对比</Typography.Text>
        {diffRows.length === 0 ? (
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0' }}>
            （与原始参数一致）
          </Typography.Paragraph>
        ) : (
          <ul style={{ margin: '4px 0 12px', paddingInlineStart: 18 }}>
            {diffRows.map((row) => (
              <li key={row.name}>
                <Typography.Text>{row.name}：</Typography.Text>
                <Typography.Text delete type="secondary">
                  {String(row.from ?? '—')}
                </Typography.Text>
                <Typography.Text> → </Typography.Text>
                <Typography.Text strong>{String(row.to ?? '—')}</Typography.Text>
              </li>
            ))}
          </ul>
        )}
        <Space>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button onClick={handleCancel}>取消</Button>
        </Space>
      </Card>
    );
  }

  // all non-editing states share the read-only body + a status-specific footer
  return (
    <div style={{ marginBottom: 12 }}>
      <SuggestedActionPreview action={action} params={params}>
        <div style={{ marginTop: 12 }}>
          {paramsEdited && status === 'suggested' ? (
            <Tag color="processing" style={{ marginBottom: 8 }}>
              参数已修改
            </Tag>
          ) : null}

          {status === 'suggested' ? (
            <Space wrap>
              <Button onClick={handleEdit}>修改参数</Button>
              <Tooltip title={onMobile ? '中/高风险动作需在移动端（RN）审批' : undefined}>
                <Button type="primary" disabled={onMobile} onClick={handleApprove}>
                  确认执行
                </Button>
              </Tooltip>
              <Tooltip title={onMobile ? '中/高风险动作需在移动端（RN）审批' : undefined}>
                <Button danger disabled={onMobile} onClick={handleReject}>
                  拒绝
                </Button>
              </Tooltip>
              {onMobile ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  该动作为{action.riskLevel === 'high' ? '高' : '中'}风险，需在移动端审批；Web 可改参不可批（§5.2）。
                </Typography.Text>
              ) : null}
            </Space>
          ) : null}

          {status === 'executing' ? (
            <Space>
              <Spin size="small" />
              <Typography.Text>执行中…</Typography.Text>
            </Space>
          ) : null}

          {status === 'success' ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                type="success"
                showIcon
                message="执行成功"
                description={executedAt ? `执行时间：${formatDateTime(executedAt)}` : undefined}
              />
              <Button onClick={handleRollback}>回滚</Button>
            </Space>
          ) : null}

          {status === 'failed' ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert type="error" showIcon message="执行失败" description={failedReason ?? undefined} />
              <Space>
                <Button type="primary" onClick={handleRetry}>
                  重试
                </Button>
                <Button onClick={handleRollback}>回滚</Button>
              </Space>
            </Space>
          ) : null}

          {status === 'rejected' ? (
            <Alert type="warning" showIcon message="已拒绝" description={`拒绝人：${OPERATOR}`} />
          ) : null}

          {status === 'rollback' ? (
            <Alert type="info" showIcon message="已回滚" description="动作已回滚到执行前状态。" />
          ) : null}
        </div>
      </SuggestedActionPreview>
    </div>
  );
}
