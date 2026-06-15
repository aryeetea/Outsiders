import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createR2Client, getMissingR2Config } from "./_r2";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const missingConfig = getMissingR2Config();
  if (missingConfig.length) {
    res.status(500).json({
      error: `Missing R2 configuration: ${missingConfig.join(", ")}`,
    });
    return;
  }

  const { fileName, contentType } = req.body || {};
  if (!fileName || !contentType) {
    res.status(400).json({ error: "Missing fileName or contentType" });
    return;
  }

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    res.status(400).json({ error: "Unsupported image type." });
    return;
  }

  const safeExtension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase().replace(/[^a-z0-9.]/g, "")
    : ".jpg";
  const key = `gallery/${crypto.randomUUID()}${safeExtension || ".jpg"}`;

  try {
    const client = createR2Client();
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const publicBaseUrl = String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

    res.status(200).json({
      uploadUrl,
      key,
      publicUrl: `${publicBaseUrl}/${key}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not create upload URL." });
  }
}
