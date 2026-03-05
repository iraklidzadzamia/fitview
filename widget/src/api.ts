export type TryOnCreateResponse = {
  data: {
    id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    pollUrl: string;
    retryAfterSec: number;
  };
};

export type TryOnStatusResponse =
  | {
    data: {
      id: string;
      status: "PENDING" | "PROCESSING";
      retryAfterSec: number;
    };
  }
  | {
    data: {
      id: string;
      status: "COMPLETED";
      resultImageUrl: string;
      resultExpiresAt: string | null;
    };
  }
  | {
    data: {
      id: string;
      status: "FAILED";
      errorMessage: string;
      canRetry: boolean;
    };
  }
  | {
    error: string;
  };

const DEFAULT_MAX_POLL_ATTEMPTS = 60;

export function getPollDelayMs(retryAfterHeader: string | null): number {
  const parsedSeconds = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN;
  if (!Number.isFinite(parsedSeconds) || parsedSeconds <= 0) {
    return 2000;
  }

  return Math.round(parsedSeconds * 1000);
}

function resolvePollUrl(apiBase: string, pollUrl: string) {
  if (pollUrl.startsWith("http://") || pollUrl.startsWith("https://")) {
    return pollUrl;
  }

  if (pollUrl.startsWith("/")) {
    // Absolute path — use just the origin, not full apiBase
    const url = new URL(apiBase);
    return `${url.origin}${pollUrl}`;
  }

  return `${apiBase.replace(/\/+$/, "")}/${pollUrl.replace(/^\/+/, "")}`;
}

export async function createTryOnRequest(input: {
  apiBase: string;
  apiKey: string;
  itemId: string;
  file: File;
}): Promise<TryOnCreateResponse["data"]> {
  const formData = new FormData();
  formData.set("person_photo", input.file);
  formData.set("catalog_item_id", input.itemId);

  const response = await fetch(`${input.apiBase.replace(/\/+$/, "")}/tryon`, {
    method: "POST",
    headers: {
      "x-api-key": input.apiKey
    },
    body: formData
  });

  const body = (await response.json()) as TryOnCreateResponse | { error: string };
  if (!response.ok || "error" in body) {
    throw new Error("error" in body ? body.error : "Failed to create try-on request");
  }

  return body.data;
}

export async function pollTryOnUntilSettled(input: {
  apiBase: string;
  apiKey: string;
  pollUrl: string;
  onProgress?: (status: "PENDING" | "PROCESSING") => void;
  maxAttempts?: number;
}): Promise<TryOnStatusResponse> {
  const absolutePollUrl = resolvePollUrl(input.apiBase, input.pollUrl);
  const maxAttempts =
    typeof input.maxAttempts === "number" && input.maxAttempts > 0
      ? Math.floor(input.maxAttempts)
      : DEFAULT_MAX_POLL_ATTEMPTS;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts += 1;
    const response = await fetch(absolutePollUrl, {
      method: "GET",
      headers: {
        "x-api-key": input.apiKey
      },
      cache: "no-store"
    });

    const payload = (await response.json()) as TryOnStatusResponse;

    if (!response.ok || "error" in payload) {
      return payload;
    }

    if (payload.data.status === "PENDING" || payload.data.status === "PROCESSING") {
      input.onProgress?.(payload.data.status);
      if (attempts >= maxAttempts) {
        break;
      }
      const delay = getPollDelayMs(response.headers.get("Retry-After"));
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    return payload;
  }

  return { error: "Request timed out, please try again" };
}
