export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured" });
  }

  const { recipients, subject, intro, ctaLabel, ctaUrl, details } = req.body;

  if (!recipients?.length || !subject) {
    return res.status(400).json({ error: "Missing recipients or subject" });
  }

  const detailRows = Array.isArray(details) && details.length
    ? `<table style="width:100%;border-collapse:collapse;margin:18px 0;">
        ${details.map((d) => `
          <tr>
            <td style="padding:8px 12px;font-size:14px;font-weight:700;color:#555;border-bottom:1px solid #f0ebe0;">${d}</td>
          </tr>`).join("")}
       </table>`
    : "";

  const ctaButton = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:28px 0;">
         <a href="${ctaUrl}"
            style="display:inline-block;padding:14px 32px;background:#ff6b6b;color:#fff;
                   font-family:'Arial Black',sans-serif;font-size:16px;font-weight:900;
                   text-decoration:none;border-radius:10px;border:3px solid #1a1a2e;
                   box-shadow:4px 4px 0 #1a1a2e;letter-spacing:0.04em;">
           ${ctaLabel} →
         </a>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f1dd;font-family:'Nunito','Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1dd;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
              <span style="font-family:'Arial Black',sans-serif;font-size:28px;font-weight:900;
                           color:#ffd93d;letter-spacing:0.06em;">OUTSIDERS</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:32px;border-left:4px solid #1a1a2e;border-right:4px solid #1a1a2e;">
              <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#1a1a2e;line-height:1.6;">
                ${intro || "You have a new update from your crew."}
              </p>
              ${detailRows}
              ${ctaButton}
              <p style="margin:24px 0 0;font-size:13px;color:#888;font-weight:600;">
                You're getting this because you're part of a crew on Outsiders.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a2e;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#667085;">
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

  // Send to all recipients
  const results = await Promise.allSettled(
    recipients.map(({ email, name }) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Outsiders <notifications@outsiderescapeclub.website>",
          to: [email],
          subject,
          html: html.replace("You have a new update from your crew.", intro || "You have a new update from your crew."),
        }),
      }).then((r) => r.json())
    )
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  const sent = results.length - failed;

  return res.status(200).json({ sent, failed });
}