import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];

function readEnv(name) {
  return String(process.env[name] || "").trim();
}

export function getMissingR2Config() {
  return requiredEnvVars.filter((key) => !readEnv(key));
}

export function createR2Client() {
  const accountId = readEnv("CLOUDFLARE_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: readEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}
