import {describe, it} from "vitest";

describe("Time based Filter", () => {
  it("should allow the owner to see the document at all times");
  it("should NOT allow principals to see the asset BEFORE the embargo date");
  it("Should NOT allow principals to see the asset AFTER the expiry date");
  it("should allow principals to see the asset if there is no time span");
});

// Also need to cover the case where, one principal is shared the asset,
//  but another principal is also shared an asset with an embargo date
// This represents sharing an asset with a marketing manager, but not letting some group, let's say the publishing team from
// being able to access the asset before the embargo date
