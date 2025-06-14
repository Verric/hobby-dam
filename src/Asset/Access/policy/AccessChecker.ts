import type {
  AccessCommand,
  AccessDoc,
  FilterStrategy,
  GrantStrategy,
} from "../AccessTypes.js";

export class AccessChecker {
  private readonly filterStrategies: FilterStrategy[];
  private readonly grantStrategies: GrantStrategy[];

  constructor(
    filterStrategies: FilterStrategy[],
    grantStrategies: GrantStrategy[]
  ) {
    this.filterStrategies = filterStrategies;
    this.grantStrategies = grantStrategies;
  }

  async evaluate(command: AccessCommand, docs: AccessDoc[]): Promise<boolean> {
    // Phase 1: Filter out invalid docs (AND logic - all filters must pass)
    let validDocs = docs;
    for (const strategy of this.filterStrategies) {
      validDocs = strategy.filter(command, validDocs);
    }

    // Return early if no valid docs remain
    if (validDocs.length === 0) {
      return false;
    }

    // Phase 2: Check if any remaining docs grant access (OR logic)

    const grantResults = await Promise.all(
      this.grantStrategies.map((strategy) =>
        strategy.evaluate(command, validDocs)
      )
    );

    return grantResults.some((result) => result === true);
  }
}
