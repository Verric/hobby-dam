import type Stream from "node:stream";
import {randomUUID} from "node:crypto";
import {fileTypeFromBuffer} from "file-type";
import type {Client} from "minio";
import type {FileStats, FileStorage} from "./FileStorage.js";

const BUCKET_NAME = "dam-demo";

export class MinioFileStorage implements FileStorage {
  private readonly client: Client;
  constructor(client: Client) {
    this.client = client;
  }

  async getObject(key: string): Promise<Buffer> {
    const objStream = await this.client.getObject(BUCKET_NAME, key);
    return await this.streamToBuffer(objStream);
  }

  async saveObject(key: string, data: Buffer): Promise<void> {
    await this.client.putObject(BUCKET_NAME, key, data);
  }
  async delete(key: string): Promise<void> {
    await this.client.removeObject(BUCKET_NAME, key);
  }
  async signObject(fileName: string): Promise<string> {
    const presignedUrl = await this.client.presignedPutObject(
      BUCKET_NAME,
      `${randomUUID()}-${fileName}`,
      3600
    );
    return presignedUrl;
  }
  async fileStats(key: string): Promise<FileStats> {
    const minioInfo = await this.client.statObject(BUCKET_NAME, key);
    const rangeLength = 4100; // file-type recommends checking up to 4100 bytes

    const stream = await this.client.getPartialObject(
      BUCKET_NAME,
      key,
      0,
      rangeLength
    );
    const buffer = await this.streamToBuffer(stream);

    // Use file-type to determine the type from the buffer
    const fileType = await fileTypeFromBuffer(buffer);
    return {
      size: minioInfo.size,
      ext: fileType?.ext ?? "unknown",
      mime: fileType?.mime ?? "unknown",
    };
  }

  private async streamToBuffer(stream: Stream.Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);
    return buffer;
  }
}
