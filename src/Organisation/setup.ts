import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import type {Db} from "mongodb";
import {TOKENS} from "../lib/tokens.js";
import {
  OrganisationController,
  type OrganisationDoc,
  OrganisationRepository,
  OrganisationService,
} from "./index.js";

export function setupOrganisation(
  container: Container,
  fastify: FastifyInstance,
  db: Db
): void {
  container
    .bind<OrganisationRepository>(TOKENS.OrganisationRepository)
    .toDynamicValue(() => {
      const coll = db.collection<OrganisationDoc>("organisations");
      return new OrganisationRepository(coll);
    })
    .inSingletonScope();

  container
    .bind<OrganisationService>(TOKENS.OrganisationService)
    .toDynamicValue((context) => {
      const orgRepo = context.get<OrganisationRepository>(
        TOKENS.OrganisationRepository
      );
      return new OrganisationService(orgRepo);
    })
    .inSingletonScope();

  container
    .bind<OrganisationController>(TOKENS.OrganisationController)
    .toDynamicValue((context) => {
      const service = context.get<OrganisationService>(TOKENS.OrganisationService);
      return new OrganisationController(service);
    })
    .inSingletonScope();

  const organisationController = container.get<OrganisationController>(
    TOKENS.OrganisationController
  );

  organisationController.registerRoutes(fastify);
}
