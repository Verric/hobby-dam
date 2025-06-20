import type {Index, MeiliSearch} from "meilisearch";
import type {WithId} from "mongodb";
import type {AssetDoc} from "../Core/index.js";
import type {IndexingService} from "./IndexingService.js";

const ASSET_INDEX = "assets" as const;

interface Document {
  id: string;
  name: string;
  organisationId: string;
  createdById: string;
  thumbnailKey: string;
}
export class MeiliService implements IndexingService {
  private readonly meili: Index<Document>;
  constructor(meili: MeiliSearch) {
    this.meili = meili.index<Document>(ASSET_INDEX);
  }

  async indexAsset(asset: WithId<AssetDoc>): Promise<void> {
    await this.meili.addDocuments([
      {
        id: asset._id.toString(),
        name: asset.name,
        organisationId: asset.organisationId,
        createdById: asset.metadata.createdById,
        thumbnailKey: asset.thumbnailKey || "",
      },
    ]);
  }

  async updateThumbnailKey(id: string, thumbnailKey: string): Promise<void> {
    await this.meili.updateDocuments([{id, thumbnailKey}]);
  }

  async removeAsset(id: string): Promise<void> {
    await this.meili.deleteDocument(id);
  }
}
