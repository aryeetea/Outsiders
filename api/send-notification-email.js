const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml({ intro, ctaLabel, ctaUrl, details = [] }) {
  const detailMarkup = details.length
    ? `<ul style="padding-left:18px;color:#475467;font:14px/1.6 Arial,sans-serif;">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>`
    : "";

  const ctaMarkup = ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#ff6b6b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font:700 14px Arial,sans-serif;">${escapeHtml(ctaLabel)}</a></p>`
    : "";

  return `
    <div style="background:#fff9ea;padding:32px;font-family:Arial,sans-serif;color:#17151f;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:3px solid #17151f;border-radius:18px;padding:28px;">
        <p style="margin:0 0 16px;font:700 14px Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#9a6700;">Outsiders Notification</p>
        <h1 style="margin:0 0 14px;font:900 28px Arial,sans-serif;color:#17151f;">${escapeHtml(intro)}</h1>
        ${detailMarkup}
        ${ctaMarkup}
      </div>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_FROM_EMAIL) {
    res.status(503).json({
      error: "Email notifications are not configured. Add RESEND_API_KEY and NOTIFICATION_FROM_EMAIL to your server environment.",
    });
    return;
  }

  const recipients = Array.isArray(req.body?.recipients) ? req.body.recipients : [];
  const subject = String(req.body?.subject || "").trim();
  const intro = String(req.body?.intro || "").trim();
  const ctaLabel = String(req.body?.ctaLabel || "Open Outsiders").trim();
  const ctaUrl = String(req.body?.ctaUrl || "").trim();
  const details = Array.isArray(req.body?.details) ? req.body.details.map((item) => String(item || "").trim()).filter(Boolean) : [];

  if (!recipients.length || !subject || !intro) {
    res.status(400).json({ error: "Recipients, subject, and intro are required." });
    return;
  }

  try {
    const deliveries = await Promise.all(recipients.map(async (recipient) => {
      const html = buildHtml({ intro, ctaLabel, ctaUrl, details });
      const textLines = [intro, ...details];
      if (ctaUrl) textLines.push(`${ctaLabel}: ${ctaUrl}`);

      const upstream = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.NOTIFICATION_FROM_EMAIL,
          to: [recipient.email],
          subject,
          html,
          text: textLines.join("\n"),
        }),
      });

      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        throw new Error(payload?.message || `Email send failed for ${recipient.email}.`);
      }

      return { email: recipient.email, id: payload?.id || null };
    }));

    res.status(200).json({ ok: true, deliveries });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Email delivery failed." });
  }
}
