import type {AssetsService} from "../Core/index.js";
import type {FileStorage} from "../FileStorage/FileStorage.js";
import type {IndexingService} from "../Indexing/IndexingService.js";
import type {ImageResizer, ThumbnailGenerator} from "./ThumbNailTypes.js";

export class BasicThumbnailGenerator implements ThumbnailGenerator {
  private readonly fileStorage: FileStorage;
  private readonly imageResizer: ImageResizer;
  private readonly assetService: AssetsService;
  private readonly indexingService: IndexingService;
  constructor(
    fileStorage: FileStorage,
    imageResizer: ImageResizer,
    assetService: AssetsService,
    indexingService: IndexingService
  ) {
    this.fileStorage = fileStorage;
    this.imageResizer = imageResizer;
    this.assetService = assetService;
    this.indexingService = indexingService;
  }

  async generateThumbnail(assetId: string): Promise<string> {
    const key = await this.assetService.fetchFileKey(assetId);
    const fileBuffer = await this.fileStorage.getObject(key);

    const resized = await this.imageResizer.resize(fileBuffer, {width: 300});

    const thumbnailKey = `thumbnails/${assetId}.jpg`;
    await this.fileStorage.saveObject(thumbnailKey, resized);
    await Promise.all([
      this.assetService.setThumbnailKey(assetId, thumbnailKey),
      this.indexingService.updateThumbnailKey(assetId, thumbnailKey),
    ]);

    return thumbnailKey;
  }
}
