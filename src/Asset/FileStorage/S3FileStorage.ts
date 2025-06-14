// import {randomUUID} from "node:crypto";
// import {
//   DeleteObjectCommand,
//   PutObjectCommand,
//   type S3Client,
// } from "@aws-sdk/client-s3";
// import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
// import type {FileStats, FileStorage} from "./FileStorage.js";

// /**
//  * Alternate impl to Minio for future cases
//  */

//
// const BUCKET_NAME = "FOO";
// export class S3FileStorage implements FileStorage {
//   private readonly client: S3Client;
//   constructor(client: S3Client) {
//     this.client = client;
//   }
//   async delete(key: string): Promise<void> {
//     const command = new DeleteObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//     });
//     await this.client.send(command);
//   }
//   async signObject(fileName: string, contentType: string): Promise<string> {
//     const Key = `${randomUUID()}-${fileName}`;
//     const command = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key,
//       ContentType: contentType,
//     });
//     const url = await getSignedUrl(this.client, command, {expiresIn: 3600});
//     return url;
//   }
//   async fileStats(key: string): Promise<FileStats> {
//     return {
//       size: 0,
//       ext: "S3-unknown",
//       mime: "S3-unknown",
//     };
//   }
// }
//keep ts happy
export {};
