import {type Static, Type} from "@sinclair/typebox";

export const GroupResponseSchema = Type.Object({
  _id: Type.String(),
  name: Type.String(),
  organisationId: Type.Optional(Type.String()),
});

export const GroupCreationSchema = Type.Object({
  name: Type.String({maxLength: 50}),
});

export type GroupCreationType = Static<typeof GroupCreationSchema>;
export const GroupArrayResponseSchema = Type.Array(GroupResponseSchema);
export interface GroupParams {
  groupId: string;
}

// Mongo stuff
export interface GroupDoc {
  name: string;
  organisationId: string;
  userIds: string[];
}
