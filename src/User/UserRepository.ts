import {type Collection, ObjectId} from "mongodb";
import type {UserDoc} from "./UserTypes.js";

export class UserRepository {
  private readonly userCollection: Collection<UserDoc>;
  constructor(userCollection: Collection<UserDoc>) {
    this.userCollection = userCollection;
  }

  async fetchUsers(organisationId: string) {
    return await this.userCollection.find({organisationId}).toArray();
  }

  async fetchUser(userId: string, organisationId: string) {
    return await this.userCollection.findOne({
      _id: new ObjectId(userId),
      organisationId,
    });
  }

  async fetchUserByName(username: string, organisationId: string) {
    const user = await this.userCollection.findOne({
      username,
      organisationId,
    });
    if (!user) throw new Error("User not Found");
    return user;
  }

  async createUser(username: string, orgId: string): Promise<string> {
    const res = await this.userCollection.insertOne({
      username,
      organisationId: orgId,
    });
    return res.insertedId.toString();
  }
}
