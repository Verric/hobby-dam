import "@fastify/jwt";
import type {BulkIngestionService} from "./Asset/BulkIngestion/index.ts";
import type {AuthService} from "./Domain/Auth/AuthService.ts";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      orgId: string;
      username: string;
      userId: string;
      accessIds: string[];
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    bulkIngestionService: BulkIngestionService;
    authService: AuthService;
  }
}
