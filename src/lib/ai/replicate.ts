import Replicate from "replicate";

import type { TryOnCategory } from "@/lib/queue/payload";

type RunVirtualTryOnInput = {
  personImageUrl: string;
  garmentImageUrl: string;
  category: TryOnCategory;
};

let cachedClient: Replicate | null = null;

function getReplicateClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("Missing required environment variable: REPLICATE_API_TOKEN");
  }

  cachedClient = new Replicate({ auth: token });
  return cachedClient;
}

function normalizeReplicateOutput(output: unknown): string {
  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    const firstUrl = output.find((item): item is string => typeof item === "string");
    if (firstUrl) {
      return firstUrl;
    }
  }

  if (output && typeof output === "object" && "url" in output) {
    const outputUrl = (output as { url?: unknown }).url;
    if (typeof outputUrl === "string") {
      return outputUrl;
    }
  }

  throw new Error("Replicate returned unexpected output payload");
}

export async function runVirtualTryOn(input: RunVirtualTryOnInput): Promise<string> {
  const client = getReplicateClient();

  const output = await client.run(
    "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
    {
      input: {
        human_img: input.personImageUrl,
        garm_img: input.garmentImageUrl,
        garment_des: `A ${input.category} clothing item`,
        category: input.category,
        crop: false,
        seed: 42,
        steps: 30
      }
    }
  );

  return normalizeReplicateOutput(output);
}
