import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];

export function getMissingR2Config() {
  return requiredEnvVars.filter((key) => !process.env[key]);
}

export function createR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}
