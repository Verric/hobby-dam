import {type Static, Type} from "@sinclair/typebox";

type Visibility = "public" | "private" | "shared";
//Mongo Stuff

export interface AssetDoc {
  organisationId: string;
  name: string;
  key: string;
  thumbnailKey?: string;
  fileInfo: {
    fileSize: number;
    fileExtention: string;
    mimeType: string;
  };
  tags: string[];
  visibility: Visibility;
  metadata: {
    createdAt: string; //date string
    updatedAt: string; // date string
    createdById: string;
    updatedById: string;
  };
}

//Asset Controller
export interface AssetIdParams {
  assetId: string;
}

export const AssetResponseSchema = Type.Object({
  _id: Type.String(),
  name: Type.String(),
  organisationId: Type.Optional(Type.String()),
  key: Type.String(),
  tags: Type.Array(Type.String()),
});

export const AssetCreationSchema = Type.Object({
  name: Type.String(),
  key: Type.String(),
  tags: Type.Array(Type.String()),
});

export const AssetAccessSchema = Type.Object({
  userIds: Type.Array(Type.String()),
  groupIds: Type.Array(Type.String()),
});

export type AssetCreationType = Static<typeof AssetCreationSchema>;
export type AssetAccessType = Static<typeof AssetAccessSchema>;
export const AssetArrayResponseSchema = Type.Array(AssetResponseSchema);
