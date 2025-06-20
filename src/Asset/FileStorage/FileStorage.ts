export interface FileStats {
  size: number;
  ext: string;
  mime: string;
}

export interface FileStorage {
  signObject(fileName: string, contentType?: string): Promise<string>;
  delete(key: string): Promise<void>;
  getObject(key: string): Promise<Buffer>;
  saveObject(key: string, data: Buffer): Promise<void>;
  fileStats(key: string): Promise<FileStats>;
}
