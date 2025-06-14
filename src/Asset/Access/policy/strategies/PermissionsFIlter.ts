import type {
  AccessCommand,
  AccessDoc,
  FilterStrategy,
} from "../../AccessTypes.js";

export class PermissionFilter implements FilterStrategy {
  filter(command: AccessCommand, docs: AccessDoc[]): AccessDoc[] {
    return docs.filter((doc) => doc.permissions.includes(command.action));
  }
}
