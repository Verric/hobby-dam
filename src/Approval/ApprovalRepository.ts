import {type Collection, ObjectId} from "mongodb";
import {ApprovalProcess} from "./ApprovalAggregate.js";
import type {
  ApprovalProcessDoc,
  ApprovalTemplateDoc,
  ApprovalTemplateStepDoc,
} from "./ApprovalTypes.js";

export class MongoApprovalProcessRepository {
  private readonly aggregateCollection: Collection<ApprovalProcessDoc>;
  private readonly stepCollection: Collection<ApprovalTemplateStepDoc>;
  private readonly templateCollection: Collection<ApprovalTemplateDoc>;
  constructor(
    aggregateCollection: Collection<ApprovalProcessDoc>,
    stepCollection: Collection<ApprovalTemplateStepDoc>,
    templateCollection: Collection<ApprovalTemplateDoc>
  ) {
    this.aggregateCollection = aggregateCollection;
    this.stepCollection = stepCollection;
    this.templateCollection = templateCollection;
  }

  async getById(id: string): Promise<ApprovalProcess | null> {
    const doc = await this.aggregateCollection.findOne({_id: new ObjectId(id)});
    if (!doc) return null;

    return ApprovalProcess.fromDTO({
      ...doc,
      id: doc._id.toHexString(),
    });
  }

  async save(process: ApprovalProcess): Promise<void> {
    const dto = process.toDTO();
    const _id = new ObjectId(dto.id);

    await this.aggregateCollection.updateOne(
      {_id},
      {$set: {...dto, _id}},
      {upsert: true}
    );
  }

  async createStep(step: ApprovalTemplateStepDoc) {
    const res = await this.stepCollection.insertOne(step);
    return await this.stepCollection.findOne({_id: res.insertedId});
  }
  async fetchStep(id: string) {
    return await this.stepCollection.findOne({_id: new ObjectId(id)});
  }
  async fetchSteps(orgId: string) {
    return await this.stepCollection.find({organisationId: orgId}).toArray();
  }
  async updateStep(id: string, step: ApprovalTemplateStepDoc) {
    await this.stepCollection.updateOne({_id: new ObjectId(id)}, {step});
  }
  async deleteStep(id: string) {
    await this.stepCollection.deleteOne({_id: new ObjectId(id)});
  }

  async createTemplate(step: ApprovalTemplateDoc) {
    const res = await this.templateCollection.insertOne(step);
    return await this.templateCollection.findOne({_id: res.insertedId});
  }
  async fetchTemplate(id: string) {
    return await this.templateCollection.findOne({_id: new ObjectId(id)});
  }
  async fetchTemplates(orgId: string) {
    return await this.templateCollection
      .find({organisationId: orgId})
      .toArray();
  }
  async updateTemplate(id: string, template: ApprovalTemplateDoc) {
    await this.templateCollection.updateOne(
      {_id: new ObjectId(id)},
      {template}
    );
  }
  async deleteTemplate(id: string) {
    await this.templateCollection.deleteOne({_id: new ObjectId(id)});
  }
}
