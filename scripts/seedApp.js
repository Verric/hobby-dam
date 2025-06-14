import "dotenv/config";
import {randomUUID} from "node:crypto";
import {MeiliSearch} from "meilisearch";
import {Client} from "minio";
import {MongoClient, ObjectId} from "mongodb";

const mongoClient = new MongoClient(process.env.MONGO_URL);
const db = mongoClient.db(process.env.MONGO_URL);
const assetsCollection = db.collection("assets");

const meiliClient = new MeiliSearch({
  host: process.env.MEILI_URL,
  apiKey: process.env.MEILI_KEY,
});

const bucket = "dam-demo";
const minioClient = new Client({
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});
const exists = await minioClient.bucketExists(bucket);
if (exists) {
  console.log(`Bucket ${bucket} exists.`);
} else {
  await minioClient.makeBucket(bucket, "us-east-1");
  console.log(`Bucket ${bucket}  created in us-east-1`);
}

async function generateAssets() {
  const orgId = new ObjectId();
  const userId = new ObjectId();
  const time = new Date().toISOString();

  const cars = [
    "blue_car.jpg",
    "brown_car.avif",
    "green_car.jpg",
    "red_car.wepb",
    "white_car.avif",
  ];

  for (const car of cars) {
    await minioClient.fPutObject(bucket, car, `../images${car}`);
    const asset = {
      _id: new ObjectId(),
      organisationId: orgId,
      name: `Asset ${randomUUID().slice(0, 8)}`,
      key: car,
      fileInfo: {},
      metadata: {
        createdById: userId,
        updatedById: userId,
        createdAt: time,
        updatedAt: time,
      },
    };
    await assetsCollection.insertOne(asset);
    await meiliClient
      .index("assets")
      .addDocuments([{id: asset._id.toString(), ...asset}]);
  }

  console.log("✅ Done!");
  process.exit(0);
}

generateAssets().catch(console.error);
