// import {describe, it, beforeAll, afterAll, expect, vi} from "vitest";
// import Fastify, {type FastifyInstance} from "fastify";
// import {MongoMemoryServer} from "mongodb-memory-server";
// import {MongoClient, type Db} from "mongodb";
// import {
//   GroupController,
//   type GroupDoc,
//   GroupService,
// } from "../../src/domain/Group/index.js";
// import {afterEach} from "node:test";

// // Mock the Auth middleware so that it always injects a test user.
// vi.mock("../../src/Auth/AuthMiddleware.js", () => {
//   return {
//     // @ts-expect-error req and reply are untyped here
//     AuthUser: async (req, reply) => {
//       // For testing, we assume the user is always authenticated with a given organisation id.
//       req.user = {orgId: "test-org", userId: "123"};
//     },
//   };
// });

// describe("Group API Integration Tests", () => {
//   let fastify: FastifyInstance;
//   let mongod: MongoMemoryServer;
//   let db: Db;
//   let client: MongoClient;

//   beforeAll(async () => {
//     // Start an in-memory MongoDB instance.
//     mongod = await MongoMemoryServer.create();
//     const uri = mongod.getUri();
//     client = new MongoClient(uri);
//     await client.connect();
//     db = client.db("testdb");

//     // Create a Fastify instance.
//     fastify = Fastify();

//     // Create the collection and instantiate repository & service.
//     const groupsCollection = db.collection<GroupDoc>("groups");
//     const groupService = new GroupService(groupsCollection);

//     // Decorate Fastify with the service so routes can access it.
//     fastify.decorate("groupService", groupService);

//     // Register the routes.
//     await fastify.register(GroupController);

//     // Ensure Fastify is ready.
//     await fastify.ready();
//   });

//   afterEach(async () => {});

//   afterAll(async () => {
//     await fastify.close();
//     await client.close();
//     await mongod.stop();
//   });

//   it("creates a group and then retrieves it", async () => {
//     const payload = {name: "Integration Test Group"};

//     // Create a new group via POST /groups.
//     const createRes = await fastify.inject({
//       method: "POST",
//       url: "/groups",
//       payload,
//     });
//     expect(createRes.statusCode).toBe(201);
//     const createdGroup = JSON.parse(createRes.body);
//     expect(createdGroup).toHaveProperty("_id");
//     expect(createdGroup.name).toBe(payload.name);

//     // Retrieve the created group via GET /groups/:groupId.
//     const getRes = await fastify.inject({
//       method: "GET",
//       url: `/groups/${createdGroup._id}`,
//     });
//     expect(getRes.statusCode).toBe(200);
//     const fetchedGroup = JSON.parse(getRes.body);
//     expect(fetchedGroup.name).toBe(payload.name);
//   });

//   it("retrieves all groups", async () => {
//     await db.collection<GroupDoc>("groups").insertOne({
//       name: "Group for all groups test",
//       organisationId: "test-org",
//       userIds: [],
//     });

//     // Fetch all groups via GET /groups.
//     const res = await fastify.inject({
//       method: "GET",
//       url: "/groups",
//     });
//     expect(res.statusCode).toBe(200);
//     const groupsArray = JSON.parse(res.body);
//     expect(groupsArray.length).toBeGreaterThan(1);
//   });

//   it.skip("deletes a group and verifies deletion", async () => {
//     // Create a group to delete.
//     const createRes = await fastify.inject({
//       method: "POST",
//       url: "/groups",
//       payload: {name: "Group to delete"},
//     });
//     const createdGroup = JSON.parse(createRes.body);

//     // Delete the group via DELETE /groups/:groupId.
//     const deleteRes = await fastify.inject({
//       method: "DELETE",
//       url: `/groups/${createdGroup._id}`,
//     });
//     expect(deleteRes.statusCode).toBe(200);
//     const deleteBody = JSON.parse(deleteRes.body);
//     expect(deleteBody.id).toBe(createdGroup._id);

//     // Verify the group no longer exists by attempting to fetch it.
//     const getRes = await fastify.inject({
//       method: "GET",
//       url: `/groups/${createdGroup._id}`,
//     });
//     // Depending on your implementation, you might expect a 404 or a null response.
//     // In our example, we assume the service returns null if not found.
//     const groupAfterDelete = JSON.parse(getRes.body);
//     expect(groupAfterDelete).toBeNull();
//   });
// });
