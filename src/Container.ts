import type {FastifyInstance} from "fastify";
import {Container} from "inversify";
import type {Db, MongoClient} from "mongodb";
import type {Logger} from "pino";
import {setupAssetModule} from "./Asset/setup.js";
import {setupAuth} from "./Auth/setup.js";
import {setupGroup} from "./Group/setup.js";
import {setupOrganisation} from "./Organisation/setup.js";
import {setupUser} from "./User/setup.js";
import {setupReport} from "./Report/setup.js";
import type {AppConfig, AppConfigInterface} from "./lib/envVars.js";
import {logger} from "./lib/myLogger.js";
import {TOKENS} from "./lib/tokens.js";
import {appEmitter, type AppEmitter} from "./lib/events/DomainEvents.js";

export function initContainer(
  mongo: MongoClient,
  fastify: FastifyInstance,
  appConfig: AppConfig
): Container {
  const container = new Container();
  const db: Db = mongo.db(appConfig.MONGO_DB_NAME);

  container.bind<Logger>(TOKENS.Logger).toConstantValue(logger);
  container
    .bind<AppConfigInterface>(TOKENS.AppConfig)
    .toConstantValue(appConfig);
  //TODO make an event emitter interface
  container.bind<AppEmitter>(TOKENS.EventEmitter).toConstantValue(appEmitter);

  // generic entity stuff
  setupOrganisation(container, fastify, db);
  setupGroup(container, fastify, db);
  setupUser(container, fastify, db);
  setupAuth(container, fastify);
  //Actual DAM stuff
  setupAssetModule(container, fastify, db);
  setupReport(container, fastify, db);

  return container;
}
