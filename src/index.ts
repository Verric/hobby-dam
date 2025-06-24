import "dotenv/config";
import {initContainer} from "./Container.js";
import {AppConfig} from "./lib/envVars.js";
import {createServer} from "./lib/fastify.js";
import {logger} from "./lib/logger.js";
import {createMongoConnection} from "./lib/mongo.js";

async function bootstrap() {
  const appConfig = new AppConfig();
  const server = await createServer();
  const {mongoDb, mongoClient} = await createMongoConnection(appConfig);

  initContainer(mongoDb, server, appConfig);

  try {
    await server.listen({port: 3000});
    logger.info("Server listening on port 3000");
  } catch (err) {
    logger.fatal("Error starting server", err);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    logger.info("Shutting down server...");
    await server.close();
    await mongoClient.close();
    logger.info("Server shut down.");
    process.exit(0);
  });
}

bootstrap();
