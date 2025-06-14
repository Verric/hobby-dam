import {type Static, Type} from "@sinclair/typebox";

export type StepStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProcessStatus = "PENDING" | "COMPLETED" | "REJECTED";
// Approval Instance
export type ApprovalProcessDoc = {
  id: string;
  organisationId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  currentStepIndex: number;
  steps: {
    name: string;
    approverId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedAt?: string;
  }[];
};

export interface ApprovalInstanceStep {
  id: string;
  name: string;
  approverId: string;
  status: StepStatus;
  approvedAt?: string;
}

// approval setup
export interface ApprovalTemplateStepDoc {
  name: string;
  organisationId: string;
  approverId: string;
}

export interface ApprovalTemplateDoc {
  name: string;
  stepIds: string[];
  organisationId: string;
}

// Request/Response Types
export interface ApprovalStepParams {
  stepId: string;
}

export interface ApprovalTemplateParams {
  templateId: string;
}

// TypeBox Schemas
export const ApprovalStepCreationSchema = Type.Object({
  name: Type.String(),
  approverId: Type.String(),
});

export const ApprovalStepUpdateSchema = Type.Object({
  name: Type.String(),
  approverId: Type.String(),
});

export const ApprovalStepResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  organisationId: Type.String(),
  approverId: Type.String(),
});

export const ApprovalStepArrayResponseSchema = Type.Array(
  ApprovalStepResponseSchema
);

export const ApprovalTemplateCreationSchema = Type.Object({
  name: Type.String(),
  stepIds: Type.Array(Type.String()),
});

export const ApprovalTemplateUpdateSchema = Type.Object({
  name: Type.String(),
  stepIds: Type.Array(Type.String()),
});

export const ApprovalTemplateResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  stepIds: Type.Array(Type.String()),
  organisationId: Type.String(),
});

export const ApprovalTemplateArrayResponseSchema = Type.Array(
  ApprovalTemplateResponseSchema
);

// Static Types from Schemas
export type ApprovalStepCreationType = Static<
  typeof ApprovalStepCreationSchema
>;
export type ApprovalStepUpdateType = Static<typeof ApprovalStepUpdateSchema>;
export type ApprovalTemplateCreationType = Static<
  typeof ApprovalTemplateCreationSchema
>;
export type ApprovalTemplateUpdateType = Static<
  typeof ApprovalTemplateUpdateSchema
>;
