import type {FastifyReply, FastifyRequest} from "fastify";

interface TokenData {
  orgId: string;
  username: string;
  userId: string;
  accessIds: string[];
}

export async function AuthUser(req: FastifyRequest, reply: FastifyReply) {
  try {
    req.user = await req.jwtVerify<TokenData>();
  } catch (err) {
    reply.code(401).send({error: "Unauthorized"});
  }
}
