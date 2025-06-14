import type {
  AccessCommand,
  AccessDoc,
  GrantStrategy,
} from "../../AccessTypes.js";

export class DirectUserGrant implements GrantStrategy {
  evaluate(command: AccessCommand, docs: AccessDoc[]): boolean {
    return docs.some(
      (doc) =>
        doc.principal.type === "user" &&
        doc.principal.id === command.principal.id
    );
  }
}
