import type { ToolAction } from '@ai-agent-desk/shared';
import { requiresMobileApproval } from '@ai-agent-desk/shared';
import { Card, Descriptions, Space, Tag, Typography } from 'antd';

import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, TOOL_ACTION_TYPE_LABELS } from '../../lib/labels';

// Read-only preview of a suggested ToolAction (Step 6). It shows the routing
// decision (PRD §5.2): medium/high → RN, low → Web. The interactive
// ToolApprovalCard (state machine, edit/diff/approve/execute/rollback) replaces
// this in Step 7.
export function SuggestedActionPreview({ action }: { action: ToolAction }) {
  const onMobile = requiresMobileApproval(action.riskLevel);
  const params = action.params as Record<string, unknown>;

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
        items={Object.entries(params).map(([key, value]) => ({
          key,
          label: key,
          children: String(value),
        }))}
      />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        可编辑 / 审批 / 执行 / 回滚的审批卡将在 Step 7 接入。
      </Typography.Text>
    </Card>
  );
}
