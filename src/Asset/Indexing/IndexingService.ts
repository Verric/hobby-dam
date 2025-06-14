import type {WithId} from "mongodb";
import type {AssetDoc} from "../Core/AssetTypes.js";

/**
 * REVIEW: Currently it's easiest to accept the asset doc as is
 * given the asset subsystem is more techincal than domain, not sure
 * if it's worth having an alternate model as well as the persisted model
 */
export interface IndexingService {
  indexAsset(asset: WithId<AssetDoc>): Promise<void>;
  removeAsset(id: string): Promise<void>;
}
