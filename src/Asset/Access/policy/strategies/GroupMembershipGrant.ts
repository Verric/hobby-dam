import type {GroupService} from "../../../../Group/index.js";
import type {
  AccessCommand,
  AccessDoc,
  GrantStrategy,
} from "../../AccessTypes.js";

export class GroupMemberGrant implements GrantStrategy {
  private readonly groupService: GroupService;

  constructor(groupService: GroupService) {
    this.groupService = groupService;
  }

  async evaluate(command: AccessCommand, docs: AccessDoc[]): Promise<boolean> {
    const groupDocs = docs.filter((doc) => doc.principal.type === "group");

    for (const doc of groupDocs) {
      const isMember = await this.groupService.userInGroup(
        doc.principal.id, // groupId
        command.principal.id // userId
      );
      if (isMember) {
        return true;
      }
    }

    return false;
  }
}
