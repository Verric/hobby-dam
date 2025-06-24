import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import type {Collection, Db} from "mongodb";
import type {AppEmitter} from "../lib/events/DomainEvents.js";
import {TOKENS} from "../lib/tokens.js";
import {ReportController} from "./ReportController.js";
import {ReportService} from "./ReportService.js";
import type {AssetReportDocument, DashboardDocument} from "./ReportTypes.js";

export function setupReport(
  container: Container,
  fastify: FastifyInstance,
  db: Db
) {
  container
    .bind<Collection<DashboardDocument>>(TOKENS.DashboardCollection)
    .toConstantValue(db.collection<DashboardDocument>("dashboard"));
  container
    .bind<Collection<AssetReportDocument>>(TOKENS.AssetReportCollection)
    .toConstantValue(db.collection<AssetReportDocument>("assetReports"));
  container
    .bind<ReportService>(TOKENS.ReportService)
    .toDynamicValue((context) => {
      const eventEmitter = context.get<AppEmitter>(TOKENS.EventEmitter);
      const dahshboardCollection = context.get<Collection<DashboardDocument>>(
        TOKENS.DashboardCollection
      );
      const assetReportCollection = context.get<
        Collection<AssetReportDocument>
      >(TOKENS.AssetReportCollection);
      return new ReportService(
        eventEmitter,
        dahshboardCollection,
        assetReportCollection
      );
    })
    .inSingletonScope();

  container
    .bind<ReportController>(TOKENS.ReportController)
    .toDynamicValue((context) => {
      const reportService = context.get<ReportService>(TOKENS.ReportService);
      return new ReportController(reportService);
    })
    .inSingletonScope();

  // Initialize the service to start listening to events
  container.get<ReportService>(TOKENS.ReportService);

  const reportController = container.get<ReportController>(
    TOKENS.ReportController
  );

  reportController.registerRoutes(fastify);
}
