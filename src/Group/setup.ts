import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import type {Db} from "mongodb";
import {TOKENS} from "../lib/tokens.js";

import {GroupController, type GroupDoc, GroupService} from "./index.js";

export function setupGroup(
  container: Container,
  fastify: FastifyInstance,
  db: Db
): void {
  container
    .bind<GroupService>(TOKENS.GroupService)
    .toDynamicValue(() => {
      const coll = db.collection<GroupDoc>("groups");
      return new GroupService(coll);
    })
    .inSingletonScope();

  container
    .bind<GroupController>(TOKENS.GroupController)
    .toDynamicValue((context) => {
      const service = context.get<GroupService>(TOKENS.GroupService);
      return new GroupController(service);
    })
    .inSingletonScope();

  const groupController = container.get<GroupController>(
    TOKENS.GroupController
  );

  groupController.registerRoutes(fastify);
}
