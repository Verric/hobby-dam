import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {AccessRepository} from "../../../src/Asset/Access/AccessRepository.js";
import type {
  AccessDoc,
  RequestViewCommand,
} from "../../../src/Asset/Access/AccessTypes.js";
import {GroupMemberGrant} from "../../../src/Asset/Access/policy/strategies/GroupMembershipGrant.js";
import type {GroupService} from "../../../src/Group/index.js";

describe("GroupMembershipStrategy", () => {
  let strategy: GroupMemberGrant;
  let mockAccessRepo: AccessRepository;
  let mockGroupService: GroupService;

  beforeEach(() => {
    mockAccessRepo = {
      fetchByAssetId: vi.fn(),
      createAccess: vi.fn(),
    } as unknown as AccessRepository;

    mockGroupService = {
      userInGroup: vi.fn(),
    } as unknown as GroupService;

    strategy = new GroupMemberGrant(mockGroupService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when user is in group with access", async () => {
    // given
    const command: RequestViewCommand = {
      resource: {id: "asset123", ownerId: "user1", visibility: "shared"},
      principal: {type: "user", id: "user2"},
      action: "view",
    };

    const docs: AccessDoc[] = [
      {
        resource: {id: "asset123", type: "asset"},
        principal: {type: "group", id: "group1"},
        accessType: "owner",
        permissions: ["view"],
      },
    ];

    vi.mocked(mockGroupService.userInGroup).mockResolvedValue(true);

    // when
    const result = await strategy.evaluate(command, docs);

    // then
    expect(result).toBe(true);
    expect(mockAccessRepo.fetchByAssetId).toHaveBeenCalledWith("asset123");
    expect(mockGroupService.userInGroup).toHaveBeenCalledWith(
      "group1",
      "user2"
    );
  });

  it("returns false when user is not in any group with access", async () => {
    // given
    const command: RequestViewCommand = {
      resource: {id: "asset123", ownerId: "user1", visibility: "shared"},
      principal: {type: "user", id: "user2"},
      action: "view",
    };
    const docs: AccessDoc[] = [
      {
        resource: {id: "asset123", type: "asset"},
        principal: {type: "group", id: "group1"},
        accessType: "share",
        permissions: ["view"],
      },
    ];

    vi.mocked(mockGroupService.userInGroup).mockResolvedValue(false);

    // when
    const result = await strategy.evaluate(command, docs);

    // then
    expect(result).toBe(false);
  });

  it("returns false when no group grants exist", async () => {
    // given
    const command: RequestViewCommand = {
      resource: {id: "asset123", ownerId: "user1", visibility: "shared"},
      principal: {type: "user", id: "user2"},
      action: "view",
    };

    // when
    const result = await strategy.evaluate(command, []);

    // then
    expect(result).toBe(false);
    expect(mockGroupService.userInGroup).not.toHaveBeenCalled();
  });
});
