import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify from "fastify";

export async function createServer() {
  const server = fastify({logger: false});

  server.setErrorHandler((error, _req, reply) => {
    if (error.validation) {
      reply.status(400).send({error: "Bad Request", message: error.message});
    } else if (error.statusCode) {
      reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    } else {
      console.error("500 ERROR", error);
      reply.status(500).send({
        error: "Internal Server Error",
        message: "Something went wrong.",
      });
    }
  });

  await server.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  await server.register(jwt, {secret: "supersecret"});

  return server;
}
