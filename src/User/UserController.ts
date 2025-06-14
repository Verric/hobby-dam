import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {AuthUser} from "../Auth/AuthMiddleware.js";
import type {GroupService} from "../Group/index.js";
import type {UserService} from "./UserService.js";
import {
  UserFetchQueryStringSchema,
  type UserIdParams,
  UserListResponseSchema,
} from "./UserTypes.js";

export class UserController {
  private readonly userService: UserService;
  private readonly groupService: GroupService;
  constructor(userSerivce: UserService, groupService: GroupService) {
    this.userService = userSerivce;
    this.groupService = groupService;
  }

  async fetchUsers(
    req: FastifyRequest<{Querystring: {includeGroupCount?: string}}>,
    reply: FastifyReply
  ) {
    const {includeGroupCount} = req.query;
    const users = await this.userService.fetchUsers(req.user.orgId);

    if (includeGroupCount === "true") {
      const usersWithGroupCount = await Promise.all(
        users.map(async (user) => {
          const groupCount = await this.groupService.countGroupsForUser(
            user._id.toString(),
            req.user.orgId
          );
          return {...user, groupCount};
        })
      );
      reply.status(200).send(usersWithGroupCount);
    }

    reply.status(200).send(users);
  }

  async fetchUser(
    req: FastifyRequest<{Params: UserIdParams}>,
    reply: FastifyReply
  ) {
    const user = await this.userService.fetchUser(
      req.params.userId,
      req.user.orgId
    );
    reply.status(200).send({user});
  }

  async createUser(
    req: FastifyRequest<{Body: {username: string}}>,
    reply: FastifyReply
  ) {
    const orgId = req.user.orgId;
    const id = await this.userService.createUser({
      username: req.body.username,
      organisationId: orgId,
    });
    reply.status(201).send({id});
  }

  async generateSearchfilter(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user.userId;
    const filterString =
      await this.userService.generateSearchFilterString(userId);
    reply.status(200).send({filterString});
  }

  registerRoutes(fastify: FastifyInstance) {
    fastify.get<{Querystring: {includeGroupCount?: string}}>("/users", {
      preHandler: AuthUser,
      handler: this.fetchUsers.bind(this),
      schema: {
        querystring: UserFetchQueryStringSchema,
        response: {200: UserListResponseSchema},
      },
    });

    //TODO add schemas
    fastify.get("/users/:userId", {
      preHandler: AuthUser,
      handler: this.fetchUser.bind(this),
    });
    //TODO add schemas
    fastify.post("/users", {
      preHandler: AuthUser,
      handler: this.createUser.bind(this),
    });

    fastify.get("/users/create-filter", {
      preHandler: AuthUser,
      handler: this.generateSearchfilter.bind(this),
    });
  }
}
