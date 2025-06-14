import type {
  AccessCommand,
  AccessDoc,
  FilterStrategy,
} from "../../AccessTypes.js";

export class DateRestrictionFilter implements FilterStrategy {
  filter(_command: AccessCommand, docs: AccessDoc[]): AccessDoc[] {
    const now = new Date();

    return docs.filter((doc) => {
      if (doc.embargoDate && new Date(doc.embargoDate) > now) {
        return false;
      }

      if (doc.expiryDate && new Date(doc.expiryDate) < now) {
        return false;
      }

      return true;
    });
  }
}
