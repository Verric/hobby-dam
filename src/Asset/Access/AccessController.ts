import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {AuthUser} from "../../Auth/index.js";
import type {AccessService} from "./AccessService.js";
import type {AccessShareBody} from "./AccessTypes.js";

export class AccessController {
  private readonly accessService: AccessService;
  constructor(accessService: AccessService) {
    this.accessService = accessService;
  }

  async shareResource(
    req: FastifyRequest<{Body: AccessShareBody}>,
    reply: FastifyReply
  ) {
    await this.accessService.shareResource(req.body.assetId);
    reply.status(200).send({success: "ok"});
  }

  registerRoutes(fastify: FastifyInstance) {
    // TODO add json schema checks
    fastify.post("/share", {
      preHandler: AuthUser,
      handler: this.shareResource.bind(this),
    });
  }
}
