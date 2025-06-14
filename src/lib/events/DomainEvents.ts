import EventEmitter from "node:events";

export const ASSET_CREATED = "ASSET_CREATED" as const;
export const ASSET_DELETED = "ASSET_DELETED" as const;
// const AssetUpdated = "AssetUpdated";
// const AssetArchived = "AssetArchived";
// const AssetDeleted = "AssetDeleted";
// const ApprovalRequested = "ApprovalRequested";
// const ApprovalCompleted = "ApprovalCompleted";
// const ApprovalRejected = "ApprovalRejected";

export interface DomainEvent<TPayload> {
  type: string;
  payload: TPayload;
  metadata: {
    timestamp: string;
    version: number;
  };
}

export interface AssetCreatedPayload {
  assetId: string;
  organisationId: string;
  createdById: string;
  name: string;
  mimeType: string;
  sizeInBytes: number;
  fileExtension: string;
  storageBackend: "S3" | "Minio";
  tags: string[];
  createdAt: string;
}

export interface AssetDeletedPayload {
  assetId: string;
  deletedById: string;
  deletedAt: string;
}

export type DomainEventMap = {
  ASSET_CREATED: [DomainEvent<AssetCreatedPayload>];
  ASSET_DELETED: [DomainEvent<AssetDeletedPayload>];
};

export const appEmitter = new EventEmitter<DomainEventMap>();
export type AppEmitter = typeof appEmitter;
