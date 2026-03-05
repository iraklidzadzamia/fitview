import sharp from "sharp";

const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_DIMENSION = 1024;

export type OutputFormat = "jpeg" | "webp";

export type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/webp";
};

export async function optimizeInputImage(
  inputBuffer: Buffer,
  inputMimeType: string,
  outputFormat: OutputFormat = "jpeg"
): Promise<OptimizedImage> {
  if (!SUPPORTED_MIME_TYPES.has(inputMimeType)) {
    throw new Error(`Unsupported image mime type: ${inputMimeType}`);
  }

  const pipeline = sharp(inputBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true
    });

  if (outputFormat === "webp") {
    const buffer = await pipeline.webp({ quality: 82 }).toBuffer();
    return {
      buffer,
      contentType: "image/webp"
    };
  }

  const buffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  return {
    buffer,
    contentType: "image/jpeg"
  };
}
