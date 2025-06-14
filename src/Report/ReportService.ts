import type {Collection} from "mongodb";
import type {
  AppEmitter,
  AssetCreatedPayload,
  AssetDeletedPayload,
  DomainEvent,
} from "../lib/events/DomainEvents.js";
import type {AssetReportDocument, DashboardDocument} from "./ReportTypes.js";

export class ReportService {
  private readonly eventEmitter: AppEmitter;
  private readonly dashboardCollection: Collection<DashboardDocument>;
  private readonly assetReportCollection: Collection<AssetReportDocument>;

  constructor(
    eventEmitter: AppEmitter,
    dashboardCollection: Collection<DashboardDocument>,
    assetReportCollection: Collection<AssetReportDocument>
  ) {
    this.eventEmitter = eventEmitter;
    this.dashboardCollection = dashboardCollection;
    this.assetReportCollection = assetReportCollection;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventEmitter.on("ASSET_CREATED", this.handleAssetCreated.bind(this));
    this.eventEmitter.on("ASSET_DELETED", this.handleAssetDeleted.bind(this));
  }

  private async handleAssetCreated(event: DomainEvent<AssetCreatedPayload>) {
    const {payload} = event;

    await this.assetReportCollection.insertOne({
      assetId: payload.assetId,
      organisationId: payload.organisationId,
      createdById: payload.createdById,
      name: payload.name,
      mimeType: payload.mimeType,
      sizeInBytes: payload.sizeInBytes,
      fileExtension: payload.fileExtension,
      storageBackend: payload.storageBackend,
      tags: payload.tags,
      createdAt: payload.createdAt,
      eventTimestamp: event.metadata.timestamp,
    });

    const dashboard = await this.dashboardCollection.findOne({
      organisationid: payload.organisationId,
    });

    if (!dashboard) {
      await this.dashboardCollection.insertOne({
        organisationId: payload.organisationId,
        totals: {totalAssets: 1},
        fileExtensions: [{extension: payload.fileExtension, count: 1}],
      });
      return;
    }

    const extIndex = dashboard.fileExtensions.findIndex(
      (e) => e.extension === payload.fileExtension
    );

    if (extIndex !== -1) {
      dashboard.fileExtensions[extIndex].count += 1;
    } else {
      dashboard.fileExtensions.push({
        extension: payload.fileExtension,
        count: 1,
      });
    }

    dashboard.totals.totalAssets += 1;

    await this.dashboardCollection.replaceOne(
      {organisationId: payload.organisationId},
      dashboard
    );
  }

  private async handleAssetDeleted(event: DomainEvent<AssetDeletedPayload>) {
    await this.assetReportCollection.deleteOne({
      assetId: event.payload.assetId,
    });
    //todo update dashboard doc
  }

  // async assetCountByOrg() {
  //   const data = await this.prisma.assetReport.groupBy({
  //     by: ["organisationId"],
  //     _count: {organisationId: true},
  //   });
  //   const result = data.map((r) => ({
  //     organisationId: r.organisationId,
  //     count: r._count.organisationId,
  //   }));
  //   return result;
  // }

  // async totalAssetSizePerOrg() {
  //   return await this.prisma.assetReport.groupBy({
  //     by: ["organisationId"],
  //     _sum: {sizeInBytes: true},
  //   });
  // }

  // async fileExtensionsByOrg(orgId: string) {
  //   const data = await this.prisma.assetReport.groupBy({
  //     by: ["fileExtension"],
  //     where: {organisationId: orgId},
  //     _count: {fileExtension: true},
  //   });
  //   const result = data.map((r) => ({
  //     extension: r.fileExtension,
  //     count: r._count.fileExtension,
  //   }));
  //   return result;
  // }

  async getDashboardByOrg(orgId: string) {
    return await this.dashboardCollection
      .find({organisationId: orgId})
      .toArray();
  }
}
