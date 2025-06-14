import {Type} from "@sinclair/typebox";

export interface UserIdParams {
  userId: string;
}
export const UserSchema = Type.Object({
  _id: Type.String(),
  username: Type.String(),
  organisationId: Type.String(),
  groupCount: Type.Optional(Type.Number()),
});

export const UserFetchQueryStringSchema = Type.Object({
  includeGroupCount: Type.Optional(Type.String()),
});

export const UserListResponseSchema = Type.Array(UserSchema);

export interface UserDoc {
  username: string;
  organisationId: string;
}
