import {beforeEach, describe, expect, it} from "vitest";
import type {
  AccessCommand,
  AccessDoc,
} from "../../../src/Asset/Access/AccessTypes.js";
import {DateRestrictionFilter} from "../../../src/Asset/Access/policy/strategies/TimeRangeFilter.js";
describe("DateRestrictionFilter", () => {
  let filter: DateRestrictionFilter;

  beforeEach(() => {
    filter = new DateRestrictionFilter();
  });

  it("should pass docs with no date restrictions", () => {
    const command: AccessCommand = {
      action: "view",
      resource: {id: "asset-1", ownerId: "user-1", visibility: "private"},
      principal: {id: "user-2", type: "user"},
    };

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset-1", type: "asset"},
        principal: {id: "user-2", type: "user"},
        permissions: ["view"],
        accessType: "share",
      },
    ];

    const result = filter.filter(command, docs);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(docs[0]);
  });

  it("should filter out docs with future embargo dates", () => {
    const command: AccessCommand = {
      action: "view",
      resource: {id: "asset-1", ownerId: "user-1", visibility: "private"},
      principal: {id: "user-2", type: "user"},
    };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset-1", type: "asset"},
        principal: {id: "user-2", type: "user"},
        permissions: ["view"],
        accessType: "share",
        embargoDate: futureDate.toISOString(),
      },
    ];

    const result = filter.filter(command, docs);
    expect(result).toHaveLength(0);
  });

  it("should pass docs with past embargo dates", () => {
    const command: AccessCommand = {
      action: "view",
      resource: {id: "asset-1", ownerId: "user-1", visibility: "private"},
      principal: {id: "user-2", type: "user"},
    };

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset-1", type: "asset"},
        principal: {id: "user-2", type: "user"},
        permissions: ["view"],
        accessType: "share",
        embargoDate: pastDate.toISOString(),
      },
    ];

    const result = filter.filter(command, docs);
    expect(result).toHaveLength(1);
  });

  it("should filter out docs with past expiry dates", () => {
    const command: AccessCommand = {
      action: "view",
      resource: {id: "asset-1", ownerId: "user-1", visibility: "private"},
      principal: {id: "user-2", type: "user"},
    };

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset-1", type: "asset"},
        principal: {id: "user-2", type: "user"},
        permissions: ["view"],
        accessType: "share",
        expiryDate: pastDate.toISOString(),
      },
    ];

    const result = filter.filter(command, docs);
    expect(result).toHaveLength(0);
  });

  it("should pass docs with future expiry dates", () => {
    const command: AccessCommand = {
      action: "view",
      resource: {id: "asset-1", ownerId: "user-1", visibility: "private"},
      principal: {id: "user-2", type: "user"},
    };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset-1", type: "asset"},
        principal: {id: "user-2", type: "user"},
        permissions: ["view"],
        accessType: "share",
        expiryDate: futureDate.toISOString(),
      },
    ];

    const result = filter.filter(command, docs);
    expect(result).toHaveLength(1);
  });
});
