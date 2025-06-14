import type {
  ApprovalTemplateStepDoc,
  ApprovalTemplateDoc,
} from "./ApprovalTypes.js";
import type {MongoApprovalProcessRepository} from "./ApprovalRepository.js";

export class ApprovalService {
  private readonly repository: MongoApprovalProcessRepository;
  constructor(repository: MongoApprovalProcessRepository) {
    this.repository = repository;
  }

  // Approval Step CRUD operations
  async createApprovalStep(step: ApprovalTemplateStepDoc) {
    return await this.repository.createStep(step);
  }

  async getApprovalStep(id: string) {
    return await this.repository.fetchStep(id);
  }

  async getApprovalSteps(organisationId: string) {
    return await this.repository.fetchSteps(organisationId);
  }

  async updateApprovalStep(id: string, step: ApprovalTemplateStepDoc) {
    return await this.repository.updateStep(id, step);
  }

  async deleteApprovalStep(id: string) {
    return await this.repository.deleteStep(id);
  }

  // Approval Template CRUD operations
  async createApprovalTemplate(template: ApprovalTemplateDoc) {
    return await this.repository.createTemplate(template);
  }

  async getApprovalTemplate(id: string) {
    return await this.repository.fetchTemplate(id);
  }

  async getApprovalTemplates(organisationId: string) {
    return await this.repository.fetchTemplates(organisationId);
  }

  async updateApprovalTemplate(id: string, template: ApprovalTemplateDoc) {
    return await this.repository.updateTemplate(id, template);
  }

  async deleteApprovalTemplate(id: string) {
    return await this.repository.deleteTemplate(id);
  }
}
