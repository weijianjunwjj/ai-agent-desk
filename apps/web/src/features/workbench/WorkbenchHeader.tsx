import type { ConversationStatus } from '@ai-agent-desk/shared';
import { Select, Space, Switch, Tooltip, Typography } from 'antd';

import { CONVERSATION_STATUS_LABELS } from '../../lib/labels';
import { useWorkbenchStore, type StatusFilter } from '../../store/workbench-store';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部状态' },
  ...(Object.keys(CONVERSATION_STATUS_LABELS) as ConversationStatus[]).map((status) => ({
    value: status,
    label: CONVERSATION_STATUS_LABELS[status],
  })),
];

// Header (PRD §7.1): 工作台标题 / 状态筛选 / Demo 操作入口.
export function WorkbenchHeader() {
  const statusFilter = useWorkbenchStore((s) => s.statusFilter);
  const setStatusFilter = useWorkbenchStore((s) => s.setStatusFilter);
  const forceFail = useWorkbenchStore((s) => s.forceNextExecutionFailure);
  const setForceFail = useWorkbenchStore((s) => s.setForceNextExecutionFailure);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 24px',
      }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        AI Agent Desk · 动作治理工作台
      </Typography.Title>
      <Space size="large">
        <Space>
          <Typography.Text type="secondary">状态筛选</Typography.Text>
          <Select<StatusFilter>
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
          />
        </Space>
        <Tooltip title="演示开关：强制下一次执行失败，用于确定性演示 failed→rollback（Step 8 生效）">
          <Space>
            <Typography.Text type="secondary">强制执行失败</Typography.Text>
            <Switch checked={forceFail} onChange={setForceFail} />
          </Space>
        </Tooltip>
      </Space>
    </div>
  );
}
