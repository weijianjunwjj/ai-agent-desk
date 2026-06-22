import type { ToolAction } from '@ai-agent-desk/shared';
import { requiresMobileApproval } from '@ai-agent-desk/shared';
import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, TOOL_ACTION_TYPE_LABELS } from '../../lib/labels';

interface Props {
  action: ToolAction;
  // Current effective params (may differ from action.params after an edit).
  params?: Record<string, unknown>;
  // Status-specific footer (banner + controls) rendered by ToolApprovalCard.
  children?: ReactNode;
}

// Read-only body of a ToolAction: header tags (type / risk / routing per §5.2),
// AI reason, and the current parameters. Shared by ToolApprovalCard across all
// non-editing states.
export function SuggestedActionPreview({ action, params, children }: Props) {
  const onMobile = requiresMobileApproval(action.riskLevel);
  const effectiveParams = params ?? (action.params as Record<string, unknown>);

  return (
    <Card
      size="small"
      type="inner"
      title={
        <Space wrap>
          <span>{action.title}</span>
          <Tag>{TOOL_ACTION_TYPE_LABELS[action.type]}</Tag>
          <Tag color={RISK_LEVEL_COLORS[action.riskLevel]}>
            {RISK_LEVEL_LABELS[action.riskLevel]}
          </Tag>
          <Tag color={onMobile ? 'volcano' : 'blue'}>
            {onMobile ? '移动端审批 · RN' : 'Web 审批'}
          </Tag>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
        {action.reason}
      </Typography.Paragraph>
      <Descriptions
        size="small"
        column={1}
        items={Object.entries(effectiveParams).map(([key, value]) => ({
          key,
          label: key,
          children: String(value),
        }))}
      />
      {children}
    </Card>
  );
}
