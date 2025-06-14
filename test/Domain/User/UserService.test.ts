import {ObjectId} from "mongodb";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {GroupService} from "../../../src/Group/index.js";
import {
  type UserDoc,
  type UserRepository,
  UserService,
} from "../../../src/User/index.js";

// Claude 4.0 wrote this whole thing. will check later although it seemed to have copied my
// (>0_0)> given, when, then comments <(0_0<)
describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: UserRepository;
  let mockGroupService: GroupService;

  beforeEach(() => {
    mockUserRepository = {
      fetchUsers: vi.fn(),
      fetchUser: vi.fn(),
      fetchUserByName: vi.fn(),
      createUser: vi.fn(),
    } as unknown as UserRepository;

    mockGroupService = {
      fetchGroup: vi.fn(),
      getAllGroups: vi.fn(),
      createGroup: vi.fn(),
      deleteGroup: vi.fn(),
      userInGroup: vi.fn(),
      countGroupsForUser: vi.fn(),
      fetchGroupsForUser: vi.fn(),
    } as unknown as GroupService;

    userService = new UserService(mockUserRepository, mockGroupService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchUsers", () => {
    it("should fetch users by organisation ID", async () => {
      // given
      const orgId = "org123";
      const mockUsers = [
        {
          _id: new ObjectId(),
          username: "user1",
          organisationId: orgId,
        },
        {
          _id: new ObjectId(),
          username: "user2",
          organisationId: orgId,
        },
      ];

      vi.mocked(mockUserRepository.fetchUsers).mockResolvedValue(mockUsers);

      // when
      const result = await userService.fetchUsers(orgId);

      // then
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.fetchUsers).toHaveBeenCalledWith(orgId);
    });

    it("should return empty array when no users found", async () => {
      // given
      const orgId = "org123";
      vi.mocked(mockUserRepository.fetchUsers).mockResolvedValue([]);

      // when
      const result = await userService.fetchUsers(orgId);

      // then
      expect(result).toEqual([]);
      expect(mockUserRepository.fetchUsers).toHaveBeenCalledWith(orgId);
    });
  });

  describe("fetchUser", () => {
    it("should fetch a single user by ID and organisation", async () => {
      // given
      const userId = "user123";
      const orgId = "org123";
      const mockUser: UserDoc = {
        username: "testuser",
        organisationId: orgId,
      };

      vi.mocked(mockUserRepository.fetchUser).mockResolvedValue({
        _id: new ObjectId(),
        ...mockUser,
      });

      // when
      const result = await userService.fetchUser(userId, orgId);

      // then
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.fetchUser).toHaveBeenCalledWith(userId, orgId);
    });

    it("should return null when user not found", async () => {
      // given
      const userId = "nonexistent";
      const orgId = "org123";

      vi.mocked(mockUserRepository.fetchUser).mockResolvedValue(null);

      // when
      const result = await userService.fetchUser(userId, orgId);

      // then
      expect(result).toBeNull();
      expect(mockUserRepository.fetchUser).toHaveBeenCalledWith(userId, orgId);
    });
  });

  describe("createUser", () => {
    it("should create a new user and return user ID", async () => {
      // given
      const createParams = {
        username: "newuser",
        organisationId: "org123",
      };
      const mockUserId = "user123";

      vi.mocked(mockUserRepository.createUser).mockResolvedValue(mockUserId);

      // when
      const result = await userService.createUser(createParams);

      // then
      expect(result).toBe(mockUserId);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        createParams.username,
        createParams.organisationId
      );
    });

    it("should handle user creation with different parameters", async () => {
      // given
      const createParams = {
        username: "anotheruser",
        organisationId: "org456",
      };
      const mockUserId = "user456";

      vi.mocked(mockUserRepository.createUser).mockResolvedValue(mockUserId);

      // when
      const result = await userService.createUser(createParams);

      // then
      expect(result).toBe(mockUserId);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        "anotheruser",
        "org456"
      );
    });
  });

  describe("fetchUsersWithGroupCount", () => {
    it("should fetch users with their group counts", async () => {
      // given
      const orgId = "org123";
      const userId1 = new ObjectId();
      const userId2 = new ObjectId();
      const mockUsers = [
        {
          _id: userId1,
          username: "user1",
          organisationId: orgId,
        },
        {
          _id: userId2,
          username: "user2",
          organisationId: orgId,
        },
      ];

      vi.mocked(mockUserRepository.fetchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockGroupService.countGroupsForUser)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(1);

      // when
      const result = await userService.fetchUsersWithGroupCount(orgId);

      // then
      expect(result).toEqual([
        {
          _id: userId1,
          username: "user1",
          organisationId: orgId,
          groupCount: 3,
        },
        {
          _id: userId2,
          username: "user2",
          organisationId: orgId,
          groupCount: 1,
        },
      ]);
      expect(mockUserRepository.fetchUsers).toHaveBeenCalledWith(orgId);
      expect(mockGroupService.countGroupsForUser).toHaveBeenCalledWith(
        userId1.toString(),
        orgId
      );
      expect(mockGroupService.countGroupsForUser).toHaveBeenCalledWith(
        userId2.toString(),
        orgId
      );
    });

    it("should handle users with zero group count", async () => {
      // given
      const orgId = "org123";
      const userId = new ObjectId();
      const mockUsers = [
        {
          _id: userId,
          username: "loneuser",
          organisationId: orgId,
        },
      ];

      vi.mocked(mockUserRepository.fetchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockGroupService.countGroupsForUser).mockResolvedValue(0);

      // when
      const result = await userService.fetchUsersWithGroupCount(orgId);

      // then
      expect(result).toEqual([
        {
          _id: userId,
          username: "loneuser",
          organisationId: orgId,
          groupCount: 0,
        },
      ]);
    });

    it("should handle empty user list", async () => {
      // given
      const orgId = "org123";
      vi.mocked(mockUserRepository.fetchUsers).mockResolvedValue([]);

      // when
      const result = await userService.fetchUsersWithGroupCount(orgId);

      // then
      expect(result).toEqual([]);
      expect(mockGroupService.countGroupsForUser).not.toHaveBeenCalled();
    });
  });

  describe("generateSearchFilterString", () => {
    it("should generate filter string with user groups", async () => {
      // given
      const userId = "user123";
      const mockGroups = [
        {
          _id: new ObjectId("507f1f77bcf86cd799439011"),
          name: "Group 1",
          organisationId: "org1",
          userIds: [],
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439012"),
          name: "Group 2",
          organisationId: "org1",
          userIds: [],
        },
      ];

      vi.mocked(mockGroupService.fetchGroupsForUser).mockResolvedValue(
        mockGroups
      );

      // when
      const result = await userService.generateSearchFilterString(userId);

      // then
      const expectedGroupFilters = mockGroups
        .map((group) => `allowedGroups:${group}`)
        .join(" OR ");
      const expectedResult = `allowedUsers:${userId} OR createdBy:${userId} OR isPublic:true OR ${expectedGroupFilters}`;

      expect(result).toBe(expectedResult);
      expect(mockGroupService.fetchGroupsForUser).toHaveBeenCalledWith(userId);
    });

    it("should generate filter string without group filters when user has no groups", async () => {
      // given
      const userId = "user123";
      vi.mocked(mockGroupService.fetchGroupsForUser).mockResolvedValue([]);

      // when
      const result = await userService.generateSearchFilterString(userId);

      // then
      const expectedResult = `allowedUsers:${userId} OR createdBy:${userId} OR isPublic:true`;
      expect(result).toBe(expectedResult);
      expect(mockGroupService.fetchGroupsForUser).toHaveBeenCalledWith(userId);
    });

    it("should handle single group correctly", async () => {
      // given
      const userId = "user123";
      const mockGroups = [
        {
          _id: new ObjectId("507f1f77bcf86cd799439013"),
          name: "Single Group",
          organisationId: "org1",
          userIds: [],
        },
      ];

      vi.mocked(mockGroupService.fetchGroupsForUser).mockResolvedValue(
        mockGroups
      );

      // when
      const result = await userService.generateSearchFilterString(userId);

      // then
      const expectedResult = `allowedUsers:${userId} OR createdBy:${userId} OR isPublic:true OR allowedGroups:${mockGroups[0]}`;
      expect(result).toBe(expectedResult);
    });

    it("should handle multiple groups correctly", async () => {
      // given
      const userId = "user456";
      const mockGroups = [
        {
          _id: new ObjectId("507f1f77bcf86cd799439014"),
          name: "Group A",
          organisationId: "org1",
          userIds: [],
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439015"),
          name: "Group B",
          organisationId: "org1",
          userIds: [],
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439016"),
          name: "Group C",
          organisationId: "org1",
          userIds: [],
        },
      ];

      vi.mocked(mockGroupService.fetchGroupsForUser).mockResolvedValue(
        mockGroups
      );

      // when
      const result = await userService.generateSearchFilterString(userId);

      // then
      const groupFilters = mockGroups
        .map((group) => `allowedGroups:${group}`)
        .join(" OR ");
      const expectedResult = `allowedUsers:${userId} OR createdBy:${userId} OR isPublic:true OR ${groupFilters}`;

      expect(result).toBe(expectedResult);
      expect(result).toContain("allowedGroups:");
      expect(result.split("allowedGroups:").length - 1).toBe(3); // Should have 3 group filters
    });
  });
});
