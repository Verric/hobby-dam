import type {
  ApprovalInstanceStep,
  ApprovalProcessDoc,
  ProcessStatus,
} from "./ApprovalTypes.js";

export class ApprovalProcess {
  private id: string;
  private organisationId: string;
  private currentStepIndex = 0;
  private status: ProcessStatus = "PENDING";
  private steps: {
    name: string;
    approverId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedAt?: string;
  }[];

  constructor(
    id: string,
    organisationId: string,
    steps: {name: string; approverId: string}[]
  ) {
    this.id = id;
    this.organisationId = organisationId;
    if (steps.length === 0 || steps.length > 5) {
      throw new Error("Steps must be between 1 and 5");
    }
    this.steps = steps.map((step) => ({
      name: step.name,
      approverId: step.approverId,
      status: "PENDING",
      approvedAt: undefined,
    }));
  }

  approveStep(approverId: string) {
    if (this.status !== "PENDING") throw new Error("Process is not active");

    const step = this.getCurrentStep();
    if (step.approverId !== approverId) throw new Error("Not authorized");

    step.status = "APPROVED";
    step.approvedAt = new Date().toISOString();
    this.currentStepIndex++;

    if (this.currentStepIndex >= this.steps.length) {
      this.status = "COMPLETED";
      this.executeSuccessStrategy();
    }
  }

  rejectStep(approverId: string) {
    if (this.status !== "PENDING") throw new Error("Process is not active");

    const step = this.getCurrentStep();
    if (step.approverId !== approverId) throw new Error("Not authorized");

    step.status = "REJECTED";
    this.status = "REJECTED";
  }

  private executeSuccessStrategy() {
    // inject via constructor or factory later
    console.log("Asset is now public");
  }

  private getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }

  getStatus(): ProcessStatus {
    return this.status;
  }
  //idk about this, im not sure how else to store these types of domain models without exposing
  // private fields, nor without resorting to reflection based shenanigans
  toDTO(): ApprovalProcessDoc {
    return {
      id: this.id,
      organisationId: this.organisationId,
      status: this.status,
      currentStepIndex: this.currentStepIndex,
      steps: this.steps,
    };
  }

  static fromDTO(dto: ApprovalProcessDoc): ApprovalProcess {
    const instance = new ApprovalProcess(dto.id, dto.organisationId, dto.steps);
    instance.status = dto.status;
    instance.currentStepIndex = dto.currentStepIndex;
    return instance;
  }
}
