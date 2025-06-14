import type {FastifyInstance} from "fastify";
import type {Container} from "inversify";
import {TOKENS} from "../lib/tokens.js";
import type {UserRepository} from "../User/UserRepository.js";
import AuthController from "./AuthController.js";
import {AuthService} from "./AuthService.js";

export function setupAuth(
  container: Container,
  fastify: FastifyInstance
): void {
  container.bind<AuthService>(TOKENS.AuthService).toDynamicValue((context) => {
    const userRepo = context.get<UserRepository>(TOKENS.UserRepository);
    return new AuthService(userRepo);
  });
  // Still using old style since this relies on fastify.jwt.sign plugin
  // will figure out how to change it later
  fastify.decorate("authService", AuthController);
}
