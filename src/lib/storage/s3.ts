import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadOptions = {
  bucket?: string;
  contentType?: string;
  cacheControl?: string;
};

let cachedClient: S3Client | null = null;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getS3Client(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  const region = requireEnv(process.env.AWS_REGION, "AWS_REGION");
  const accessKeyId = requireEnv(process.env.AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv(process.env.AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY");

  cachedClient = new S3Client({
    region,
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return cachedClient;
}

function normalizeKey(key: string): string {
  return key.replace(/^\/+/, "");
}

function resolveObjectUrl(bucket: string, key: string): string {
  const normalizedKey = normalizeKey(key);
  const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${normalizedKey}`;
  }

  const endpoint = process.env.AWS_S3_ENDPOINT?.replace(/\/+$/, "");
  if (endpoint) {
    return `${endpoint}/${bucket}/${normalizedKey}`;
  }

  const region = requireEnv(process.env.AWS_REGION, "AWS_REGION");
  return `https://${bucket}.s3.${region}.amazonaws.com/${normalizedKey}`;
}

export async function uploadToS3(
  body: Buffer,
  key: string,
  options: UploadOptions = {}
): Promise<string> {
  const bucket = options.bucket ?? requireEnv(process.env.AWS_S3_BUCKET, "AWS_S3_BUCKET");
  const normalizedKey = normalizeKey(key);
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
      Body: body,
      ContentType: options.contentType ?? "application/octet-stream",
      CacheControl: options.cacheControl
    })
  );

  return resolveObjectUrl(bucket, normalizedKey);
}
