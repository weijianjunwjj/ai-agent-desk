// Entry point for @ai-agent-desk/shared.
//
// This package holds ONLY framework-free logic (PRD §3.4 / §13): Zod schemas,
// derived types, the XState approval machine, shared constants, and the
// approval-routing policy. It must never import React / react-native / any UI.
//
// Scaffold placeholder for Step 1 — real exports arrive in:
//   - Step 2: types + Zod schemas + TOOL_ACTION_PARAMS_SCHEMAS + requiresMobileApproval (§10 / §5.2)
//   - Step 3: approvalMachine (§9.3)
export const SHARED_PACKAGE_NAME = '@ai-agent-desk/shared';
