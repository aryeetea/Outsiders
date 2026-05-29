function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    res.status(500).json({ error: "RESEND_API_KEY is not configured" });
    return;
  }

  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "Outsiders <notifications@outsiderescapeclub.website>";
  const { recipients, subject, intro, ctaLabel, ctaUrl, details } = req.body || {};

  if (!Array.isArray(recipients) || !recipients.length || !subject) {
    res.status(400).json({ error: "Missing recipients or subject" });
    return;
  }

  const safeIntro = escapeHtml(intro || "You have a new update from your crew.");
  const safeSubject = String(subject || "").trim();
  const detailRows = Array.isArray(details) && details.length
    ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin:18px 0;">
        ${details.map((detail) => `
          <tr>
            <td style="padding:12px 14px;font-size:14px;font-weight:700;color:#555;border-bottom:1px solid #f0ebe0;background:#fff8e8;border-radius:10px;">${escapeHtml(detail)}</td>
          </tr>`).join("")}
       </table>`
    : "";

  const ctaButton = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:28px 0;">
         <a class="email-button" href="${escapeHtml(ctaUrl)}"
            style="display:inline-block;padding:14px 32px;background:#ff6b6b;color:#fff;
                   font-family:'Arial Black',sans-serif;font-size:16px;font-weight:900;
                   text-decoration:none;border-radius:10px;border:3px solid #1a1a2e;
                   box-shadow:4px 4px 0 #1a1a2e;letter-spacing:0.04em;">
           ${escapeHtml(ctaLabel)} →
         </a>
       </div>`
    : "";

  const text = [
    intro || "You have a new update from your crew.",
    ...(Array.isArray(details) ? details : []),
    ctaLabel && ctaUrl ? `${ctaLabel}: ${ctaUrl}` : "",
  ].filter(Boolean).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media screen and (max-width: 640px) {
      .email-shell { padding: 20px 12px !important; }
      .email-card { border-width: 3px !important; border-radius: 18px !important; }
      .email-header,
      .email-body,
      .email-footer { padding-left: 18px !important; padding-right: 18px !important; }
      .email-header { padding-top: 20px !important; padding-bottom: 20px !important; }
      .email-body { padding-top: 24px !important; padding-bottom: 24px !important; }
      .email-title { font-size: 24px !important; }
      .email-copy { font-size: 15px !important; }
      .email-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f7f1dd;font-family:'Nunito','Arial',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safeIntro}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1dd;">
    <tr>
      <td align="center" class="email-shell" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td class="email-header email-card" style="background:#1a1a2e;border:4px solid #1a1a2e;border-bottom:none;border-radius:20px 20px 0 0;padding:24px 32px;text-align:center;">
              <span style="font-family:'Arial Black',sans-serif;font-size:28px;font-weight:900;
                           color:#ffd93d;letter-spacing:0.06em;">OUTSIDERS</span>
            </td>
          </tr>
          <tr>
            <td class="email-body email-card" style="background:#fff;padding:32px;border-left:4px solid #1a1a2e;border-right:4px solid #1a1a2e;">
              <p class="email-title" style="margin:0 0 12px;font-size:28px;font-weight:900;color:#1a1a2e;line-height:1.15;">
                Crew update
              </p>
              <p class="email-copy" style="margin:0 0 16px;font-size:17px;font-weight:700;color:#1a1a2e;line-height:1.6;">
                ${safeIntro}
              </p>
              ${detailRows}
              ${ctaButton}
              <p style="margin:24px 0 0;font-size:13px;color:#888;font-weight:600;line-height:1.5;">
                You're getting this because you're part of a crew on Outsiders.
              </p>
            </td>
          </tr>
          <tr>
            <td class="email-footer email-card" style="background:#1a1a2e;border:4px solid #1a1a2e;border-top:none;border-radius:0 0 20px 20px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#c2c8d0;line-height:1.5;">
                © ${new Date().getFullYear()} Outsiders · outsiderescapeclub.website
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const results = await Promise.allSettled(
    recipients.map(async ({ email }) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: safeSubject,
          html,
          text,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || `Resend request failed with status ${response.status}`);
      }

      return payload;
    })
  );

  const failed = results.filter((result) => result.status === "rejected").length;
  const sent = results.length - failed;

  res.status(failed && !sent ? 502 : 200).json({
    sent,
    failed,
    errors: results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "Email send failed"),
  });
}
