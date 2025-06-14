import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {AuthUser} from "../Auth/index.js";
import type {ReportService} from "./ReportService.js";

export class ReportController {
  private readonly reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  async fetchDashboardByOrg(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.reportService.getDashboardByOrg(req.user.orgId);
    reply.status(200).send(result);
  }

  registerRoutes(fastify: FastifyInstance) {
    fastify.get("/reports/dashboard", {
      preHandler: AuthUser,
      handler: this.fetchDashboardByOrg.bind(this),
    });
  }
}
