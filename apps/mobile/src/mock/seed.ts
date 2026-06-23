// Seeds the RN approval inbox by reusing the SAME Mock LLM Adapter and routing
// policy as Web (PRD §8 / §5.2): run the adapter on the demo conversation, then
// keep only the actions that route to mobile (requiresMobileApproval === true).
// This demonstrates Web/RN sharing of types, schema and policy via packages/shared.
import { DEMO_CUSTOMER_MESSAGE, mockLLMAdapter } from '@ai-agent-desk/mock-ai';
import type { ApprovalTask, Customer, ToolAction } from '@ai-agent-desk/shared';
import { requiresMobileApproval } from '@ai-agent-desk/shared';

export interface TaskDetail {
  task: ApprovalTask;
  action: ToolAction;
  customerName: string;
  customerSummary: string;
  lastMessage: string;
}

const demoCustomer: Customer = {
  id: 'cust_zhang',
  name: '张女士',
  company: '云图科技',
  level: 'gold',
  tags: ['price_sensitive', 'comparing_competitors'],
  summary: '黄金客户，正在比较竞品，对价格敏感，希望获得优惠。',
  lastContactAt: new Date().toISOString(),
};

export async function seedInbox(): Promise<TaskDetail[]> {
  const conversationId = 'conv_zhang';
  const analysis = await mockLLMAdapter.analyzeConversation({
    conversationId,
    latestMessage: DEMO_CUSTOMER_MESSAGE,
    customer: demoCustomer,
    previousMessages: [],
  });

  return analysis.nextActions
    .filter((action) => requiresMobileApproval(action.riskLevel))
    .map((action) => ({
      task: {
        id: `task_${action.id}`,
        actionId: action.id,
        conversationId,
        customerName: demoCustomer.name,
        actionTitle: action.title,
        riskLevel: action.riskLevel,
        status: 'pending',
        pushedAt: new Date().toISOString(),
      },
      action,
      customerName: demoCustomer.name,
      customerSummary: demoCustomer.summary,
      lastMessage: DEMO_CUSTOMER_MESSAGE,
    }));
}
