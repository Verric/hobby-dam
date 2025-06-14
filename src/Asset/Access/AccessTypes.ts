import type {WithId} from "mongodb";

export type Permission = "view" | "download" | "full";
export type Principal = {id: string; type: "user" | "group"};
export type Resource = {id: string; type: "asset"};

export interface AccessDoc {
  /**Entity being shared */
  resource: Resource;
  /**With whom the entity is being shared with */
  principal: Principal;
  /** What permissions the principal is allowed to perform*/
  permissions: Permission[];
  accessType: "owner" | "share";
  embargoDate?: string; // ISO-8601
  expiryDate?: string; // ISO-8601
}

export interface AccessShareBody {
  assetId: string;
}

export interface BaseAccessCommand {
  resource: {
    id: string;
    ownerId: string;
    visibility: "public" | "private" | "shared";
  };
  principal: Principal;
}

export interface RequestViewCommand extends BaseAccessCommand {
  action: "view";
}

export interface RequestDownloadCommand extends BaseAccessCommand {
  action: "download";
}

export interface RequestFullAccessCommand extends BaseAccessCommand {
  action: "full";
}

export type AccessCommand =
  | RequestViewCommand
  | RequestDownloadCommand
  | RequestFullAccessCommand;

export interface AccessStrategy {
  shouldEvaluate(command: AccessCommand, docs: AccessDoc[]): boolean;
  evaluate(
    command: AccessCommand,
    docs: AccessDoc[]
  ): Promise<boolean> | boolean;
}

export interface FilterStrategy {
  filter(command: AccessCommand, docs: AccessDoc[]): AccessDoc[];
}

export interface GrantStrategy {
  evaluate(
    command: AccessCommand,
    docs: AccessDoc[]
  ): Promise<boolean> | boolean;
}

// types/AccessRepository.ts
export interface IAccessRepository {
  fetchById(id: string): Promise<AccessDoc | null>;
  fetchByAssetId(assetId: string): Promise<AccessDoc[]>;
  createAccess(
    assetId: string,
    principal: Principal,
    permission: Permission
  ): Promise<WithId<AccessDoc> | null>;
}

// types/AccessService.ts
export interface IAccessService {
  shareResource(assetId: string): Promise<AccessDoc>;
  canPerform(command: AccessCommand): Promise<boolean>;
}
