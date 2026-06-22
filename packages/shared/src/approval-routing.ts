// Approval-routing policy (PRD §5.2) — single source of truth for whether a
// ToolAction is approved on Web or on RN. One ToolAction has exactly one
// approver; there is no Web + RN double approval.
import type { RiskLevel } from './enums';

// 风险达到该阈值的 ToolAction 由 RN 审批；低于阈值在 Web 审批。
export const MOBILE_APPROVAL_RISK_THRESHOLD: RiskLevel = 'medium';

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

export function requiresMobileApproval(risk: RiskLevel): boolean {
  return RISK_ORDER[risk] >= RISK_ORDER[MOBILE_APPROVAL_RISK_THRESHOLD];
}
