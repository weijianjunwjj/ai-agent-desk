-- CreateTable
CREATE TABLE "ToolAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TEXT,
    "executedAt" TEXT,
    "failedReason" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "originalParams" TEXT NOT NULL,
    "editedParams" TEXT
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "actionId" TEXT,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "operatorType" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "beforeSnapshot" TEXT,
    "afterSnapshot" TEXT,
    "createdAt" TEXT NOT NULL
);
