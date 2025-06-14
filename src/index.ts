import "dotenv/config";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify from "fastify";
import {MongoClient} from "mongodb";
import {initContainer} from "./Container.js";
import {AppConfig} from "./lib/envVars.js";

async function bootstrap() {
  const appConfig = new AppConfig();
  const server = fastify({logger: false});
  const mongo: MongoClient = new MongoClient(appConfig.MONGO_URL);

  server.setErrorHandler((error, _request, reply) => {
    if (error.validation) {
      reply.status(400).send({error: "Bad Request", message: error.message});
    } else if (error.statusCode) {
      reply
        .status(error.statusCode)
        .send({error: error.name, message: error.message});
    } else {
      console.error("500 ERROR", error);
      reply.status(500).send({
        error: "Internal Server Error",
        message: "Something went wrong.",
      });
    }
  });

  server.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  server.register(jwt, {secret: "supersecret"});

  await mongo.connect();

  initContainer(mongo, server, appConfig);

  try {
    await server.listen({port: 3000});
    console.log("Server listening on port 3000");
  } catch (err) {
    console.error("Error starting server", err);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await server.close();
    await mongo.close();
    console.log("Server shut down.");
    process.exit(0);
  });
}

bootstrap();
