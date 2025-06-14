import type {Algoliasearch} from "algoliasearch";
import type {WithId} from "mongodb";
import type {AccessService} from "../Access/AccessService.js";
import type {AssetDoc} from "../Core/index.js";
import type {IndexingService} from "./IndexingService.js";

const ASSET_INDEX = "assets" as const;

export class AlgoliaService implements IndexingService {
  private readonly algolia: Algoliasearch;
  private readonly accessService: AccessService;
  constructor(algolia: Algoliasearch, accessService: AccessService) {
    this.algolia = algolia;
    this.accessService = accessService;
  }

  async indexAsset(asset: WithId<AssetDoc>): Promise<void> {
    const assetId = asset._id.toString();
    const accessDocs =
      await this.accessService.fetchAccessDocsForAsset(assetId);

    // im sure we could do this in some single line using lodash and groupBy or something
    // but meh
    const allowedUsers = accessDocs
      .filter((doc) => doc.principal.type === "user")
      .map((doc) => doc.principal.id);

    const allowedGroups = accessDocs
      .filter((doc) => doc.principal.type === "group")
      .map((doc) => doc.principal.id);

    await this.algolia.saveObject({
      indexName: ASSET_INDEX,
      body: {
        objectID: assetId,
        name: asset.name,
        tags: asset.tags,
        allowedUsers,
        allowedGroups,
        isPublic: asset.visibility === "public",
        createdBy: asset.metadata.createdById,
      },
    });
  }

  async removeAsset(id: string): Promise<void> {
    await this.algolia.deleteObject({indexName: ASSET_INDEX, objectID: id});
  }
}
