import type {WithId} from "mongodb";
import type {AccessRepository} from "./AccessRepository.js";
import type {AccessCommand, AccessDoc} from "./AccessTypes.js";
import type {AccessChecker} from "./policy/AccessChecker.js";

export class AccessService {
  private readonly accessChecker: AccessChecker;
  private readonly accessRepo: AccessRepository;

  constructor(accessRepo: AccessRepository, accessChecker: AccessChecker) {
    this.accessRepo = accessRepo;
    this.accessChecker = accessChecker;
  }

  async fetchAccessDocsForAsset(assetId: string): Promise<WithId<AccessDoc>[]> {
    return await this.accessRepo.fetchByAssetId(assetId);
  }

  //TODO put in real implementation
  async shareResource(assetId: string) {
    const doc = await this.accessRepo.createAccess(
      assetId,
      {id: "123", type: "user"},
      "view"
    );
    return doc;
  }

  async canPerform(command: AccessCommand): Promise<boolean> {
    const {principal, resource} = command;

    // Early bailout for owner
    if (principal.id === resource.ownerId) return true;
    const accessDocs = await this.accessRepo.fetchByAssetId(resource.id);
    return await this.accessChecker.evaluate(command, accessDocs);
  }
}
