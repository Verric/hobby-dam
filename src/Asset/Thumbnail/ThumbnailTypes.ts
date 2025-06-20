export interface ThumbnailGenerator {
  generateThumbnail(assetId: string): Promise<string>;
}

export interface ResizeOptions {
  width: number;
}

export interface ImageResizer {
  resize(input: Buffer, options: ResizeOptions): Promise<Buffer>;
}
