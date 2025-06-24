import {type Db, MongoClient} from "mongodb";
import type {AppConfigInterface} from "./envVars.js";

interface Mongo {
  mongoDb: Db;
  mongoClient: MongoClient;
}
export async function createMongoConnection(
  config: AppConfigInterface
): Promise<Mongo> {
  const mongoClient = new MongoClient(config.MONGO_URL);
  const mongoDb: Db = mongoClient.db(config.MONGO_DB_NAME);
  await mongoClient.connect();
  return {mongoDb, mongoClient};
}
