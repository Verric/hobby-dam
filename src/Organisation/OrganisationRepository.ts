import type {Collection} from "mongodb";
import type {OrganisationDoc} from "./OrganisationTypes.js";

export class OrganisationRepository {
  private readonly orgCollection: Collection<OrganisationDoc>;

  constructor(orgCollection: Collection<OrganisationDoc>) {
    this.orgCollection = orgCollection;
  }

  async findAll() {
    return this.orgCollection.find().toArray();
  }

  async insertOne(doc: Omit<OrganisationDoc, "_id">) {
    const res = await this.orgCollection.insertOne(doc);
    const org = await this.orgCollection.findOne({_id: res.insertedId});
    if (!org) throw new Error("Could not fetch created org");
    return org;
  }
}
