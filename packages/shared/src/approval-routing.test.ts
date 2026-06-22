// Contract test for the approval-routing policy (PRD §12 quality gate / §5.2):
// low → Web, medium / high → RN.
import { describe, expect, it } from 'vitest';

import { MOBILE_APPROVAL_RISK_THRESHOLD, requiresMobileApproval } from './approval-routing';

describe('requiresMobileApproval (PRD §5.2)', () => {
  it('阈值为 medium', () => {
    expect(MOBILE_APPROVAL_RISK_THRESHOLD).toBe('medium');
  });

  it('low → Web 审批（低于阈值）', () => {
    expect(requiresMobileApproval('low')).toBe(false);
  });

  it('medium → RN 审批（达到阈值）', () => {
    expect(requiresMobileApproval('medium')).toBe(true);
  });

  it('high → RN 审批', () => {
    expect(requiresMobileApproval('high')).toBe(true);
  });
});
