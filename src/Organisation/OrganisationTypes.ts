import {type Static, Type} from "@sinclair/typebox";

export const CreateOrganisationSchema = Type.Object({
  name: Type.String({maxLength: 50}),
});

export type CreateOrganisationType = Static<typeof CreateOrganisationSchema>;

export const CreateOrganisationResponseSchema = Type.Object({
  id: Type.String(),
});

export const FetchOrganisationResponseSchema = Type.Object({
  _id: Type.String(),
  name: Type.String(),
});

export const FetchOrganisationsResponseSchema = Type.Array(
  FetchOrganisationResponseSchema
);

export interface OrganisationDoc {
  name: string;
}

export interface CreateOrganisationParams {
  name: string;
}
