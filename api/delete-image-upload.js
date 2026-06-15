import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client, getMissingR2Config } from "./_r2";

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

  const { key } = req.body || {};
  if (!key) {
    res.status(400).json({ error: "Missing image key." });
    return;
  }

  try {
    const client = createR2Client();
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Could not delete image." });
  }
}
