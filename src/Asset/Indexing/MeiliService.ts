import type {Index, MeiliSearch} from "meilisearch";
import type {WithId} from "mongodb";
import type {AssetDoc} from "../Core/index.js";
import type {IndexingService} from "./IndexingService.js";

const ASSET_INDEX = "assets" as const;
export class MeiliService implements IndexingService {
  private readonly meili: Index;
  constructor(meili: MeiliSearch) {
    this.meili = meili.index(ASSET_INDEX);
  }

  async indexAsset(asset: WithId<AssetDoc>): Promise<void> {
    await this.meili.addDocuments([
      {
        id: asset._id.toString(),
        name: asset.name,
        organisationId: asset.organisationId,
        createdById: asset.metadata.createdById,
      },
    ]);
  }

  async removeAsset(id: string): Promise<void> {
    await this.meili.deleteDocument(id);
  }
}
