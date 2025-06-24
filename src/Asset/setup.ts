import {algoliasearch} from "algoliasearch";
import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import {Client} from "minio";
import type {Collection, Db} from "mongodb";
import type {GroupService} from "../Group/index.js";
import type {AppConfigInterface} from "../lib/envVars.js";
import type {AppEmitter} from "../lib/events/DomainEvents.js";
import {TOKENS} from "../lib/tokens.js";
import {AccessController} from "./Access/AccessController.js";
import {AccessRepository} from "./Access/AccessRepository.js";
import {AccessService} from "./Access/AccessService.js";
import type {AccessDoc} from "./Access/AccessTypes.js";
import {AccessChecker} from "./Access/policy/AccessChecker.js";
import {GroupMemberGrant} from "./Access/policy/strategies/GroupMembershipGrant.js";
import {AssetController} from "./Core/AssetController.js";
import {type AssetDoc, AssetRepository, AssetsService} from "./Core/index.js";
import type {FileStorage} from "./FileStorage/FileStorage.js";
import {MinioFileStorage} from "./FileStorage/MinioFileStorage.js";
import {AlgoliaService} from "./Indexing/AlgoliaService.js";
import type {IndexingService} from "./Indexing/IndexingService.js";

export async function setupAssetModule(
  container: Container,
  fastify: FastifyInstance,
  db: Db
) {
  const minioClient = new Client({
    endPoint: "127.0.0.1",
    port: 9000,
    useSSL: false,
    accessKey: "minioadmin",
    secretKey: "minioadmin",
  });

  container
    .bind<FileStorage>(TOKENS.FileStorage)
    .toConstantValue(new MinioFileStorage(minioClient));

  // Bind external Algolia service as a constant value
  container
    .bind<IndexingService>(TOKENS.IndexingService)
    .toDynamicValue((context) => {
      const appConfig = context.get<AppConfigInterface>(TOKENS.AppConfig);
      const accessService = context.get<AccessService>(TOKENS.AccessService);
      const algoliaClient = algoliasearch(
        appConfig.ALGOLIA_APP_ID,
        appConfig.ALGOLIA_ADMIN_KEY
      );
      return new AlgoliaService(algoliaClient, accessService);
    })
    .inSingletonScope();

  container
    .bind<Collection<AccessDoc>>(TOKENS.AccessCollection)
    .toConstantValue(db.collection<AccessDoc>("access"));
  container
    .bind<Collection<AssetDoc>>(TOKENS.AssetCollection)
    .toConstantValue(db.collection<AssetDoc>("assets"));

  container
    .bind<AssetRepository>(TOKENS.AssetRepository)
    .toDynamicValue((context) => {
      const collection = context.get<Collection<AssetDoc>>(
        TOKENS.AssetCollection
      );
      return new AssetRepository(collection);
    })
    .inSingletonScope();

  container
    .bind<AssetsService>(TOKENS.AssetsService)
    .toDynamicValue((context) => {
      const assetRepo = context.get<AssetRepository>(TOKENS.AssetRepository);
      const fileStorage = context.get<FileStorage>(TOKENS.FileStorage);
      const indexingService = context.get<IndexingService>(
        TOKENS.IndexingService
      );
      const eventEmitter = context.get<AppEmitter>(TOKENS.EventEmitter);
      //const accessService = context.get<AccessService>(TOKENS.AccessService);
      return new AssetsService(
        assetRepo,
        fileStorage,
        indexingService,
        eventEmitter
      );
    })
    .inSingletonScope();

  container
    .bind<AssetController>(TOKENS.AssetController)
    .toDynamicValue((context) => {
      const assetService = context.get<AssetsService>(TOKENS.AssetsService);
      const accessService = context.get<AccessService>(TOKENS.AccessService);
      return new AssetController(assetService, accessService);
    })
    .inSingletonScope();

  // ACCESS
  container
    .bind<AccessRepository>(TOKENS.AccessRepository)
    .toDynamicValue((context) => {
      const collection = context.get<Collection<AccessDoc>>(
        TOKENS.AccessCollection
      );
      return new AccessRepository(collection);
    })
    .inSingletonScope();

  container
    .bind<GroupMemberGrant>(TOKENS.GroupStrategy)
    .toDynamicValue((context) => {
      const group = context.get<GroupService>(TOKENS.GroupService);
      return new GroupMemberGrant(group);
    })
    .inSingletonScope();

  container
    .bind<AccessChecker>(TOKENS.AccessChecker)
    .toDynamicValue((context) => {
      const groupStrat = context.get<GroupMemberGrant>(TOKENS.GroupStrategy);
      return new AccessChecker([], [groupStrat]);
    });

  container
    .bind<AccessService>(TOKENS.AccessService)
    .toDynamicValue((context) => {
      const repo = context.get<AccessRepository>(TOKENS.AccessRepository);
      const checker = context.get<AccessChecker>(TOKENS.AccessChecker);
      return new AccessService(repo, checker);
    })
    .inSingletonScope();

  container
    .bind<AccessController>(TOKENS.AccessController)
    .toDynamicValue((context) => {
      const service = context.get<AccessService>(TOKENS.AccessService);
      return new AccessController(service);
    })
    .inSingletonScope();

  //REGSITER ROUTES
  const assetController = container.get<AssetController>(
    TOKENS.AssetController
  );
  const accessController = container.get<AccessController>(
    TOKENS.AccessController
  );

  assetController.registerRoutes(fastify);
  accessController.registerRoutes(fastify);
}
