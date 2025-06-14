import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

import {AuthUser} from "../Auth/index.js";
import type {ApprovalService} from "./ApprovalSerivce.js";
import {
  ApprovalStepArrayResponseSchema,
  ApprovalStepCreationSchema,
  type ApprovalStepCreationType,
  type ApprovalStepParams,
  ApprovalStepResponseSchema,
  ApprovalStepUpdateSchema,
  type ApprovalStepUpdateType,
  ApprovalTemplateArrayResponseSchema,
  ApprovalTemplateCreationSchema,
  type ApprovalTemplateCreationType,
  type ApprovalTemplateParams,
  ApprovalTemplateResponseSchema,
  ApprovalTemplateUpdateSchema,
  type ApprovalTemplateUpdateType,
} from "./ApprovalTypes.js";

export class ApprovalController {
  private readonly approvalService: ApprovalService;
  constructor(approvalService: ApprovalService) {
    this.approvalService = approvalService;
  }

  // Approval Step Methods
  async fetchAllApprovalSteps(req: FastifyRequest, reply: FastifyReply) {
    const {orgId} = req.user;
    const docs = await this.approvalService.getApprovalSteps(orgId);
    reply.code(200).send(docs);
  }

  async fetchApprovalStep(
    req: FastifyRequest<{Params: ApprovalStepParams}>,
    reply: FastifyReply
  ) {
    const docs = await this.approvalService.getApprovalStep(req.params.stepId);
    reply.code(200).send(docs);
  }

  async createApprovalStep(
    req: FastifyRequest<{Body: ApprovalStepCreationType}>,
    reply: FastifyReply
  ) {
    const {name, approverId} = req.body;
    const {orgId} = req.user;
    const stepDoc = {
      name,
      organisationId: orgId,
      approverId,
      status: "PENDING" as const,
    };
    const newStep = await this.approvalService.createApprovalStep(stepDoc);
    reply.status(201).send(newStep);
  }

  async updateApprovalStep(
    req: FastifyRequest<{
      Params: ApprovalStepParams;
      Body: ApprovalStepUpdateType;
    }>,
    reply: FastifyReply
  ) {
    const {stepId} = req.params;
    const existingStep = await this.approvalService.getApprovalStep(stepId);
    //todo push this down to the repo. make findOrThrowMethod
    if (!existingStep) throw new Error("NotFound");
    const updatedDoc = {...existingStep, ...req.body};
    const updatedStep = await this.approvalService.updateApprovalStep(
      stepId,
      updatedDoc
    );
    reply.status(200).send(updatedStep);
  }

  async deleteApprovalStep(
    req: FastifyRequest<{Params: ApprovalStepParams}>,
    reply: FastifyReply
  ) {
    const {stepId} = req.params;
    await this.approvalService.deleteApprovalStep(stepId);
    reply.status(200).send({id: stepId});
  }

  // Approval Template Methods
  async fetchAllApprovalTemplates(req: FastifyRequest, reply: FastifyReply) {
    const {orgId} = req.user;
    const docs = await this.approvalService.getApprovalTemplates(orgId);
    reply.code(200).send(docs);
  }

  async fetchApprovalTemplate(
    req: FastifyRequest<{Params: ApprovalTemplateParams}>,
    reply: FastifyReply
  ) {
    const docs = await this.approvalService.getApprovalTemplate(
      req.params.templateId
    );
    reply.code(200).send(docs);
  }

  async createApprovalTemplate(
    req: FastifyRequest<{Body: ApprovalTemplateCreationType}>,
    reply: FastifyReply
  ) {
    const {name, stepIds} = req.body;
    const {orgId} = req.user;
    const templateDoc = {
      name,
      stepIds,
      organisationId: orgId,
    };
    const newTemplate =
      await this.approvalService.createApprovalTemplate(templateDoc);
    reply.status(201).send(newTemplate);
  }

  async updateApprovalTemplate(
    req: FastifyRequest<{
      Params: ApprovalTemplateParams;
      Body: ApprovalTemplateUpdateType;
    }>,
    reply: FastifyReply
  ) {
    const {templateId} = req.params;
    const {orgId} = req.user;
    const existingTemplate =
      await this.approvalService.getApprovalTemplate(templateId);
    const updatedTemplateDoc = {
      ...existingTemplate,
      ...req.body,
      organisationId: orgId,
    };
    const updatedTemplate = await this.approvalService.updateApprovalTemplate(
      templateId,
      updatedTemplateDoc
    );
    reply.status(200).send(updatedTemplate);
  }

  async deleteApprovalTemplate(
    req: FastifyRequest<{Params: ApprovalTemplateParams}>,
    reply: FastifyReply
  ) {
    const {templateId} = req.params;
    await this.approvalService.deleteApprovalTemplate(templateId);
    reply.status(200).send({id: templateId});
  }

  registerRoutes(fastify: FastifyInstance) {
    // Approval Step Routes
    fastify.get("/approval-steps", {
      preHandler: AuthUser,
      schema: {response: {200: ApprovalStepArrayResponseSchema}},
      handler: this.fetchAllApprovalSteps.bind(this),
    });

    fastify.get<{Params: ApprovalStepParams}>("/approval-steps/:stepId", {
      preHandler: AuthUser,
      schema: {response: {200: ApprovalStepResponseSchema}},
      handler: this.fetchApprovalStep.bind(this),
    });

    fastify.post<{Body: ApprovalStepCreationType}>("/approval-steps", {
      preHandler: AuthUser,
      schema: {
        body: ApprovalStepCreationSchema,
        response: {201: ApprovalStepResponseSchema},
      },
      handler: this.createApprovalStep.bind(this),
    });

    fastify.put<{Params: ApprovalStepParams; Body: ApprovalStepUpdateType}>(
      "/approval-steps/:stepId",
      {
        preHandler: AuthUser,
        schema: {
          body: ApprovalStepUpdateSchema,
          response: {200: ApprovalStepResponseSchema},
        },
        handler: this.updateApprovalStep.bind(this),
      }
    );

    fastify.delete<{Params: ApprovalStepParams}>("/approval-steps/:stepId", {
      preHandler: AuthUser,
      handler: this.deleteApprovalStep.bind(this),
    });

    // Approval Template Routes
    fastify.get("/approval-templates", {
      preHandler: AuthUser,
      schema: {response: {200: ApprovalTemplateArrayResponseSchema}},
      handler: this.fetchAllApprovalTemplates.bind(this),
    });

    fastify.get<{Params: ApprovalTemplateParams}>(
      "/approval-templates/:templateId",
      {
        preHandler: AuthUser,
        schema: {response: {200: ApprovalTemplateResponseSchema}},
        handler: this.fetchApprovalTemplate.bind(this),
      }
    );

    fastify.post<{Body: ApprovalTemplateCreationType}>("/approval-templates", {
      preHandler: AuthUser,
      schema: {
        body: ApprovalTemplateCreationSchema,
        response: {201: ApprovalTemplateResponseSchema},
      },
      handler: this.createApprovalTemplate.bind(this),
    });

    fastify.put<{
      Params: ApprovalTemplateParams;
      Body: ApprovalTemplateUpdateType;
    }>("/approval-templates/:templateId", {
      preHandler: AuthUser,
      schema: {
        body: ApprovalTemplateUpdateSchema,
        response: {200: ApprovalTemplateResponseSchema},
      },
      handler: this.updateApprovalTemplate.bind(this),
    });

    fastify.delete<{Params: ApprovalTemplateParams}>(
      "/approval-templates/:templateId",
      {
        preHandler: AuthUser,
        handler: this.deleteApprovalTemplate.bind(this),
      }
    );
  }
}
