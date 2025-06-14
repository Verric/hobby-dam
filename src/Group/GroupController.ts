import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

import {AuthUser} from "../Auth/index.js";
import type {GroupService} from "./GroupService.js";
import {
  GroupArrayResponseSchema,
  GroupCreationSchema,
  type GroupCreationType,
  type GroupParams,
  GroupResponseSchema,
} from "./GroupTypes.js";

export class GroupController {
  private readonly groupService: GroupService;
  constructor(groupService: GroupService) {
    this.groupService = groupService;
  }

  async fetchAllGroups(req: FastifyRequest, reply: FastifyReply) {
    const {orgId} = req.user;
    const docs = await this.groupService.getAllGroups(orgId);
    reply.code(200).send(docs);
  }

  async fetchGroup(
    req: FastifyRequest<{Params: GroupParams}>,
    reply: FastifyReply
  ) {
    const docs = await this.groupService.fetchGroup(req.params.groupId);
    reply.code(200).send(docs);
  }

  async createGroup(
    req: FastifyRequest<{Body: GroupCreationType}>,
    reply: FastifyReply
  ) {
    const {name} = req.body;
    const {orgId} = req.user;
    const newTeam = await this.groupService.createGroup(name, orgId);
    reply.status(201).send(newTeam);
  }

  async deleteGroup(
    req: FastifyRequest<{Params: GroupParams}>,
    reply: FastifyReply
  ) {
    const {groupId} = req.params;
    await this.groupService.deleteGroup(groupId);
    reply.status(200).send({id: groupId});
  }

  registerRoutes(fastify: FastifyInstance) {
    fastify.get("/groups", {
      preHandler: AuthUser,
      schema: {response: {200: GroupArrayResponseSchema}},
      handler: this.fetchAllGroups.bind(this),
    });

    fastify.get<{Params: GroupParams}>("/groups/:groupId", {
      preHandler: AuthUser,
      schema: {response: {200: GroupResponseSchema}},
      handler: this.fetchGroup.bind(this),
    });
    fastify.post<{Body: GroupCreationType}>("/groups", {
      preHandler: AuthUser,
      schema: {
        body: GroupCreationSchema,
        response: {201: GroupResponseSchema},
      },
      handler: this.createGroup.bind(this),
    });
    //TODO add schema Validation
    fastify.delete("/groups/:groupId", {
      preHandler: AuthUser,
      handler: this.deleteGroup.bind(this),
    });
  }
}
