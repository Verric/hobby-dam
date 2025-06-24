import type {FastifyInstance} from "fastify";
import {Container} from "inversify";
import type {Db} from "mongodb";
import type {Logger} from "pino";
import {setupAssetModule} from "./Asset/setup.js";
import {setupAuth} from "./Auth/setup.js";
import {setupGroup} from "./Group/setup.js";
import type {AppConfig, AppConfigInterface} from "./lib/envVars.js";
import {type AppEmitter, appEmitter} from "./lib/events/DomainEvents.js";
import {logger} from "./lib/logger.js";
import {TOKENS} from "./lib/tokens.js";
import {setupOrganisation} from "./Organisation/setup.js";
import {setupReport} from "./Report/setup.js";
import {setupUser} from "./User/setup.js";

export function initContainer(
  mongoDb: Db,
  fastify: FastifyInstance,
  appConfig: AppConfig
): Container {
  const container = new Container();

  //Core Bindings
  container.bind<Logger>(TOKENS.Logger).toConstantValue(logger);
  container
    .bind<AppConfigInterface>(TOKENS.AppConfig)
    .toConstantValue(appConfig);
  container.bind<AppEmitter>(TOKENS.EventEmitter).toConstantValue(appEmitter);

  // Non-Core
  setupOrganisation(container, fastify, mongoDb);
  setupGroup(container, fastify, mongoDb);
  setupUser(container, fastify, mongoDb);
  setupAuth(container, fastify);

  //DAM
  setupAssetModule(container, fastify, mongoDb);
  setupReport(container, fastify, mongoDb);

  return container;
}
