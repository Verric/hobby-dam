import {type Collection, ObjectId, type WithId} from "mongodb";
import type {AssetDoc} from "./AssetTypes.js";

export class AssetRepository {
  private readonly mongo: Collection<AssetDoc>;
  constructor(mongo: Collection<AssetDoc>) {
    this.mongo = mongo;
  }

  async fetchAsset(assetId: string): Promise<WithId<AssetDoc> | null> {
    return await this.mongo.findOne({_id: new ObjectId(assetId)});
  }
  async fetchAssetOrThrow(assetId: string): Promise<WithId<AssetDoc>> {
    const result = await this.mongo.findOne({_id: new ObjectId(assetId)});
    if (!result) throw new Error("Asset Not Found");
    return result;
  }

  // TODO add organisationId to this
  async fetchAllAssets(): Promise<WithId<AssetDoc>[]> {
    return await this.mongo.find().toArray();
  }

  async saveAsset(
    name: string,
    key: string,
    organisationId: string,
    userId: string,
    fileSize: number,
    fileExtention: string,
    mimeType: string,
    tags: string[]
  ) {
    const time = new Date().toISOString();
    const metadata = {
      createdAt: time,
      updatedAt: time,
      createdById: userId,
      updatedById: userId,
    };
    const fileInfo = {
      fileSize,
      fileExtention,
      mimeType,
    };
    const result = await this.mongo.insertOne({
      name,
      key,
      organisationId,
      metadata,
      visibility: "private",
      tags,
      fileInfo,
    });
    const doc = await this.mongo.findOne({_id: result.insertedId});
    if (!doc) throw new Error("TODO, fix error handling");
    return doc;
  }

  async setAccess(assetId: string, userIds: string[], groupIds: string[]) {
    const id = new ObjectId(assetId);
    const doc = this.mongo.findOne({_id: id}, {projection: {_id: 1}});
    if (!doc) throw new Error("Asset Not Found");
  }

  async deleteAsset(id: string) {
    await this.mongo.deleteOne({_id: new ObjectId(id)});
  }
}
