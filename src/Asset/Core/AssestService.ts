import {
  type AppEmitter,
  ASSET_CREATED,
  ASSET_DELETED,
  type AssetCreatedPayload,
  type AssetDeletedPayload,
  type DomainEvent,
} from "../../lib/events/DomainEvents.js";
import type {FileStorage} from "../FileStorage/FileStorage.js";
import type {IndexingService} from "../Indexing/IndexingService.js";
import type {AssetRepository} from "./AssetRepository.js";

export class AssetsService {
  private readonly repo: AssetRepository;
  private readonly fileService: FileStorage;
  private readonly indexing: IndexingService;
  private readonly eventEmitter: AppEmitter;
  constructor(
    repo: AssetRepository,
    fileService: FileStorage,
    indexing: IndexingService,
    eventEmitter: AppEmitter
  ) {
    this.fileService = fileService;
    this.repo = repo;
    this.indexing = indexing;
    this.eventEmitter = eventEmitter;
  }

  async fetchAllAssets() {
    return await this.repo.fetchAllAssets();
  }

  async fetchAssetById(id: string) {
    return await this.repo.fetchAssetOrThrow(id);
  }

  async fetchFileKey(id: string) {
    const doc = await this.repo.fetchAssetKey(id);
    return doc.key;
  }

  async setThumbnailKey(id: string, thumbnailKey: string) {
    await this.repo.saveThumbnailKey(id, thumbnailKey);
  }

  async createAsset(
    name: string,
    key: string,
    organisationId: string,
    userId: string,
    tags: string[]
  ) {
    const {size, ext, mime} = await this.fileService.fileStats(key);
    const doc = await this.repo.saveAsset(
      name,
      key,
      organisationId,
      userId,
      size,
      ext,
      mime,
      tags
    );
    await this.indexing.indexAsset(doc);

    const event: DomainEvent<AssetCreatedPayload> = {
      type: "Asset Created",
      payload: {
        assetId: doc._id.toString(),
        organisationId: organisationId,
        createdById: userId,
        name: name,
        mimeType: mime,
        sizeInBytes: size,
        fileExtension: ext,
        storageBackend: "Minio",
        tags: tags,
        createdAt: doc.metadata.createdAt,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: 1,
      },
    };

    this.eventEmitter.emit(ASSET_CREATED, event);

    return doc;
  }

  async deleteAsset(id: string, userId: string): Promise<boolean> {
    try {
      const doc = await this.repo.fetchAsset(id);
      if (!doc) throw new Error("File not found");

      await Promise.all([
        this.repo.deleteAsset(id),
        this.fileService.delete(doc.key),
        this.indexing.removeAsset(id),
      ]);
      const event: DomainEvent<AssetDeletedPayload> = {
        type: ASSET_DELETED,
        payload: {
          assetId: id,
          deletedById: userId,
          deletedAt: new Date().toISOString(),
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: 1,
        },
      };

      this.eventEmitter.emit(ASSET_DELETED, event);
      return true;
    } catch (_e) {
      return false;
    }
  }

  async preSignUpload(fileName: string, contentType: string): Promise<string> {
    return await this.fileService.signObject(fileName, contentType);
  }
}
