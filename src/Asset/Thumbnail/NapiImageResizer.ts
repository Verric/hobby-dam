import {ResizeFilterType, Transformer} from "@napi-rs/image";
import type {ImageResizer, ResizeOptions} from "./ThumbnailTypes.js";

// TODO, base out type on input type instead of just JPEG
export class NapiImageResizer implements ImageResizer {
  async resize(input: Buffer, options: ResizeOptions): Promise<Buffer> {
    const transformer = new Transformer(input).resize(
      options.width,
      null,
      ResizeFilterType.Lanczos3
    );
    return transformer.jpeg();
  }
}
