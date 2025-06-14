import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import type OrganisationService from "./OrganisationService.js";
import {
  CreateOrganisationResponseSchema,
  CreateOrganisationSchema,
  type CreateOrganisationType,
  FetchOrganisationsResponseSchema,
} from "./OrganisationTypes.js";

export class OrganisationController {
  private readonly organisationService: OrganisationService;
  constructor(organisationService: OrganisationService) {
    this.organisationService = organisationService;
  }

  async fetchAllOrgs(_req: FastifyRequest, reply: FastifyReply) {
    const orgs = await this.organisationService.fetchOrganisations();
    reply.status(200).send(orgs);
  }

  async createOrganistion(
    req: FastifyRequest<{Body: CreateOrganisationType}>,
    reply: FastifyReply
  ) {
    const {name} = req.body;
    const result = await this.organisationService.createOrganisation({name});
    reply.status(201).send(result);
  }

  async registerRoutes(fastify: FastifyInstance) {
    fastify.get("/organisations", {
      schema: {response: {200: FetchOrganisationsResponseSchema}},
      handler: this.fetchAllOrgs.bind(this),
    });

    fastify.post<{Body: CreateOrganisationType}>("/organisations", {
      schema: {
        body: CreateOrganisationSchema,
        response: {201: CreateOrganisationResponseSchema},
      },
      handler: this.createOrganistion.bind(this),
    });
  }
}
