import type {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {AuthUser} from "../../Auth/index.js";
import type {AccessService} from "../Access/AccessService.js";
import type {RequestViewCommand} from "../Access/AccessTypes.js";
import type {AssetsService} from "./AssestService.js";
import {
  AssetArrayResponseSchema,
  AssetCreationSchema,
  type AssetCreationType,
  type AssetIdParams,
  AssetResponseSchema,
} from "./AssetTypes.js";
interface UploadParams {
  filename: string;
  contentType: string;
}

export class AssetController {
  private readonly assetService: AssetsService;
  private readonly accessService: AccessService;
  constructor(assetService: AssetsService, accessService: AccessService) {
    this.assetService = assetService;
    this.accessService = accessService;
  }

  //TODO could be removed as indexing service does this
  async fetchAssets(_req: FastifyRequest, reply: FastifyReply) {
    const docs = await this.assetService.fetchAllAssets();
    reply.code(200).send(docs);
  }

  async fetchAsset(
    req: FastifyRequest<{Params: AssetIdParams}>,
    reply: FastifyReply
  ) {
    const doc = await this.assetService.fetchAssetById(req.params.assetId);
    //TODO think about nicely importing type
    const command: RequestViewCommand = {
      resource: {
        id: doc._id.toString(),
        ownerId: doc.metadata.createdById,
        visibility: doc.visibility,
      },
      principal: {type: "user", id: req.user.userId},
      action: "view",
    };

    const canAccess = await this.accessService.canPerform(command);
    if (!canAccess) {
      throw new Error("Can not access asset");
    }
    reply.code(200).send(doc);
  }

  async createAsset(
    req: FastifyRequest<{Body: AssetCreationType}>,
    reply: FastifyReply
  ) {
    const {name, key, tags} = req.body;
    const {orgId, userId} = req.user;
    const newAsset = await this.assetService.createAsset(
      name,
      key,
      orgId,
      userId,
      tags
    );
    reply.status(201).send(newAsset);
  }

  async deleteAsset(
    req: FastifyRequest<{Params: AssetIdParams}>,
    reply: FastifyReply
  ) {
    const {assetId} = req.params;
    await this.assetService.deleteAsset(assetId, req.user.userId);
    reply.status(200).send({id: assetId});
  }

  async preSignUpload(
    req: FastifyRequest<{Body: UploadParams}>,
    reply: FastifyReply
  ) {
    const {filename, contentType} = req.body;
    if (!filename || !contentType) {
      return reply.status(400).send({error: "Missing filename or contentType"});
    }
    const url = await this.assetService.preSignUpload(filename, contentType);
    reply.status(200).send({url, method: "PUT"});
  }

  // Route Definitions
  registerRoutes(fastify: FastifyInstance) {
    fastify.get("/assets", {
      schema: {response: {200: AssetArrayResponseSchema}},
      preHandler: AuthUser,
      handler: this.fetchAssets.bind(this),
    });

    //TODO add a params to Schema
    fastify.get<{Params: AssetIdParams}>("/assets/:assetId", {
      schema: {response: {200: AssetResponseSchema}},
      preHandler: AuthUser,
      handler: this.fetchAsset.bind(this),
    });

    fastify.post<{Body: AssetCreationType}>("/assets", {
      schema: {
        body: AssetCreationSchema,
        response: {201: AssetResponseSchema},
      },
      preHandler: AuthUser,
      handler: this.createAsset.bind(this),
    });

    // fastify.put<{Params: AssetIdParams; Body: AssetAccessType}>(
    //   "/assets/:assetId/access",
    //   {
    //     preHandler: AuthUser,
    //     schema: {
    //       body: AssetAccessSchema,
    //       response: {201: AssetResponseSchema},
    //     },
    //   },
    //   async (req, res) => {
    //     const {assetId} = req.params;
    //     const {userIds, groupIds} = req.body;
    //     const asset = await fastify.assetService.setAccessControls(
    //       assetId,
    //       userIds,
    //       groupIds
    //     );
    //     res.status(200).send(asset);
    //   }
    // );

    fastify.delete("/assets/:assetId", {
      preHandler: AuthUser,
      handler: this.deleteAsset.bind(this),
    });

    //TODO add json schema validation
    fastify.post<{Body: UploadParams}>("/assets/signUrl", {
      handler: this.preSignUpload.bind(this),
    });
  }
}
// fastify.put<{Params: AssetIdParams; Body: AssetAccessType}>(
//   "/assets/:assetId/access",
//   {
//     preHandler: AuthUser,
//     schema: {
//       body: AssetAccessSchema,
//       response: {201: AssetResponseSchema},
//     },
//   },
//   async (req, res) => {
//     const {assetId} = req.params;
//     const {userIds, groupIds} = req.body;
//     const asset = await fastify.assetService.setAccessControls(
//       assetId,
//       userIds,
//       groupIds
//     );
//     res.status(200).send(asset);
//   }
// );

// fastify.post("/assets/test", async (req, res) => {
//   const command = new InvokeCommand({
//     FunctionName: "asset-dam-creator",
//     Payload: Buffer.from(
//       JSON.stringify({assetId: "123", fileName: "example.png"})
//     ),
//   });

//   const response = await client.send(command);

//   console.log(
//     "Lambda response:",
//     new TextDecoder().decode(response.Payload)
//   );
// });
