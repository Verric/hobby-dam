import {type Static, Type} from "@sinclair/typebox";
import type {FastifyInstance} from "fastify";

const LoginSchema = Type.Object({
  orgId: Type.String(),
  username: Type.String(),
});

const LoginResponseSchema = Type.Object({
  token: Type.String(),
});

type LoginType = Static<typeof LoginSchema>;

export default async function (fastify: FastifyInstance) {
  fastify.post<{Body: LoginType}>(
    "/login",
    {schema: {body: LoginSchema, response: {200: LoginResponseSchema}}},
    async (req, reply) => {
      const {orgId, username} = req.body;
      const user = await fastify.authService.authLogin(username, orgId);
      const token = fastify.jwt.sign({
        orgId: user.organisationId,
        username: user.username,
        userId: user._id.toString(),
        //accessIds: user.accessIds,
      });
      reply.status(200).send({token});
    }
  );
}
