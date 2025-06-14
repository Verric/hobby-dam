import {type Collection, ObjectId} from "mongodb";
import type {GroupDoc} from "./GroupTypes.js";

export class GroupService {
  private readonly groupCollection: Collection<GroupDoc>;

  constructor(collection: Collection<GroupDoc>) {
    this.groupCollection = collection;
  }

  async fetchGroup(groupId: string) {
    return await this.groupCollection.findOne({_id: new ObjectId(groupId)});
  }

  async getAllGroups(organisationId: string) {
    return await this.groupCollection.find({organisationId}).toArray();
  }

  async createGroup(name: string, organisationId: string) {
    const result = await this.groupCollection.insertOne({
      name,
      organisationId,
      userIds: [],
    });
    const doc = await this.groupCollection.findOne({_id: result.insertedId});
    return doc;
  }

  async deleteGroup(groupId: string) {
    await this.groupCollection.deleteOne({_id: new ObjectId(groupId)});
  }

  // idk,only need this for GroupAccessStrategy
  async userInGroup(groupId: string, userId: string) {
    const res = await this.groupCollection.countDocuments({
      _id: new ObjectId(groupId),
      userIds: {$in: [userId]},
    });
    return res === 1;
  }

  async countGroupsForUser(
    userId: string,
    organisationId: string
  ): Promise<number> {
    return await this.groupCollection.countDocuments({
      organisationId,
      userIds: userId,
    });
  }

  async fetchGroupsForUser(userId: string) {
    return await this.groupCollection
      .find({userIds: {$in: [userId]}})
      .toArray();
  }
}
