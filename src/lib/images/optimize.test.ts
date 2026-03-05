import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { optimizeInputImage } from "./optimize";

describe("optimizeInputImage", () => {
  it("resizes large images to max 1024px and returns jpeg output", async () => {
    const source = await sharp({
      create: {
        width: 2048,
        height: 1536,
        channels: 3,
        background: { r: 240, g: 30, b: 80 }
      }
    })
      .png()
      .toBuffer();

    const optimized = await optimizeInputImage(source, "image/png");
    const metadata = await sharp(optimized.buffer).metadata();

    expect(optimized.contentType).toBe("image/jpeg");
    expect(metadata.width).toBeLessThanOrEqual(1024);
    expect(metadata.height).toBeLessThanOrEqual(1024);
  });

  it("throws for unsupported mime type", async () => {
    const source = Buffer.from("not-an-image");
    await expect(optimizeInputImage(source, "application/pdf")).rejects.toThrow(/unsupported/i);
  });
});
