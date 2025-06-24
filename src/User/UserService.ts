import type {WithId} from "mongodb";
import type {GroupService} from "../Group/GroupService.js";
import type {UserRepository} from "./UserRepository.js";
import type {UserDoc} from "./UserTypes.js";

interface CreateUserParams {
  username: string;
  organisationId: string;
}
export class UserService {
  private readonly repo: UserRepository;
  private readonly groupService: GroupService;
  constructor(repo: UserRepository, groupService: GroupService) {
    this.repo = repo;
    this.groupService = groupService;
  }

  async fetchUsers(orgId: string): Promise<WithId<UserDoc>[]> {
    return await this.repo.fetchUsers(orgId);
  }
  async fetchUser(userId: string, orgId: string): Promise<UserDoc | null> {
    return await this.repo.fetchUser(userId, orgId);
  }

  async createUser(params: CreateUserParams): Promise<string> {
    return await this.repo.createUser(params.username, params.organisationId);
  }

  async fetchUsersWithGroupCount(organisationId: string) {
    const users = await this.repo.fetchUsers(organisationId);

    const usersWithGroupCounts = await Promise.all(
      users.map(async (user) => ({
        ...user,
        groupCount: await this.groupService.countGroupsForUser(
          user._id.toString(),
          organisationId
        ),
      }))
    );

    return usersWithGroupCounts;
  }

  async generateSearchFilterString(userId: string): Promise<string> {
    const userGroups = await this.groupService.fetchGroupsForUser(userId);

    const groupFilters = userGroups
      .map((groupId) => `allowedGroups:${groupId}`)
      .join(" OR ");

    const baseFilters = `allowedUsers:${userId} OR createdBy:${userId} OR isPublic:true`;
    const filters = groupFilters
      ? `${baseFilters} OR ${groupFilters}`
      : baseFilters;

    return filters;
  }
}
