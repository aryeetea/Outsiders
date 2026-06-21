import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client, getMissingR2Config } from "./_r2";

function sanitizeFileName(fileName = "hangout-photo.jpg") {
  return String(fileName || "hangout-photo.jpg")
    .replace(/[\r\n"]/g, "")
    .trim() || "hangout-photo.jpg";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const missingConfig = getMissingR2Config();
  if (missingConfig.length) {
    res.status(500).json({
      error: `Missing R2 configuration: ${missingConfig.join(", ")}. Add these server environment variables in Vercel Project Settings, then redeploy.`,
    });
    return;
  }

  const key = String(req.query?.key || "").trim();
  if (!key) {
    res.status(400).json({ error: "Missing image key." });
    return;
  }

  try {
    const client = createR2Client();
    const response = await client.send(new GetObjectCommand({
      Bucket: String(process.env.R2_BUCKET_NAME || "").trim(),
      Key: key,
    }));

    if (!response.Body) {
      res.status(404).json({ error: "Image not found." });
      return;
    }

    const bytes = await response.Body.transformToByteArray();
    const fileName = sanitizeFileName(req.query?.filename || key.split("/").pop());
    const dispositionType = req.query?.download === "1" ? "attachment" : "inline";

    res.setHeader("Content-Type", response.ContentType || "application/octet-stream");
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Disposition", `${dispositionType}; filename="${fileName}"`);
    res.status(200).send(Buffer.from(bytes));
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404 || error?.name === "NoSuchKey") {
      res.status(404).json({ error: "Image not found." });
      return;
    }
    console.error("gallery-image failed", error);
    res.status(500).json({ error: error?.message || "Could not load image." });
  }
}
