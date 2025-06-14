import {type Collection, ObjectId, type WithId} from "mongodb";
import type {
  AccessDoc,
  IAccessRepository,
  Permission,
  Principal,
} from "./AccessTypes.js";

export class AccessRepository implements IAccessRepository {
  private readonly access: Collection<AccessDoc>;
  constructor(access: Collection<AccessDoc>) {
    this.access = access;
  }

  async fetchById(accessId: string) {
    return await this.access.findOne({_id: new ObjectId(accessId)});
  }

  async fetchByAssetId(assetId: string) {
    return await this.access.find({"resource.id": assetId}).toArray();
  }

  async createAccess(
    assetId: string,
    principal: Principal,
    permission: Permission
  ): Promise<WithId<AccessDoc> | null> {
    const temp = await this.access.insertOne({
      resource: {id: assetId, type: "asset"},
      principal,
      accessType: "owner",
      permissions: [permission],
    });
    const doc = await this.access.findOne({_id: temp.insertedId});
    return doc;
  }
}
