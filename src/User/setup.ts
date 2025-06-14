import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import type {Db} from "mongodb";

import type {GroupService} from "../Group/index.js";
import {TOKENS} from "../lib/tokens.js";
import {
  UserController,
  type UserDoc,
  UserRepository,
  UserService,
} from "./index.js";

export function setupUser(
  container: Container,
  fastify: FastifyInstance,
  db: Db
): void {
  container
    .bind<UserRepository>(TOKENS.UserRepository)
    .toDynamicValue(() => {
      const coll = db.collection<UserDoc>("users");
      const repo = new UserRepository(coll);
      return repo;
    })
    .inSingletonScope();

  container
    .bind<UserService>(TOKENS.UserService)
    .toDynamicValue((context) => {
      const userRepo = context.get<UserRepository>(TOKENS.UserRepository);
      const groupService = context.get<GroupService>(TOKENS.GroupService);
      return new UserService(userRepo, groupService);
    })
    .inSingletonScope();

  container
    .bind<UserController>(TOKENS.UserController)
    .toDynamicValue((context) => {
      const userService = context.get<UserService>(TOKENS.UserService);
      const groupService = context.get<GroupService>(TOKENS.GroupService);
      return new UserController(userService, groupService);
    })
    .inSingletonScope();

  // Register Routes
  const userController = container.get<UserController>(TOKENS.UserController);

  userController.registerRoutes(fastify);
}
