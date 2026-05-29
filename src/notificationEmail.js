const EMAIL_API_URL = "/api/send-email";

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

/**
 * Send notification emails to a list of recipients.
 *
 * @param {object} options
 * @param {Array<{email: string, name: string}>} options.recipients
 * @param {string} options.subject
 * @param {string} options.intro
 * @param {string} [options.ctaLabel]
 * @param {string} [options.ctaUrl]
 * @param {string[]} [options.details]
 * @param {string[]} [options.excludeEmails]
 */
export async function sendNotificationEmails({
  recipients = [],
  subject = "",
  intro = "",
  ctaLabel = "",
  ctaUrl = "",
  details = [],
  excludeEmails = [],
}) {
  const excluded = new Set((excludeEmails || []).map(normalizeEmail).filter(Boolean));
  const seen = new Set();
  const cleanedRecipients = (recipients || []).filter((recipient) => {
    const normalizedEmail = normalizeEmail(recipient?.email);
    if (!normalizedEmail || !normalizedEmail.includes("@")) return false;
    if (excluded.has(normalizedEmail) || seen.has(normalizedEmail)) return false;
    seen.add(normalizedEmail);
    return true;
  });

  if (!cleanedRecipients.length || !subject) {
    return { skipped: true, reason: "no-valid-recipients", recipients: 0 };
  }

  try {
    const response = await fetch(EMAIL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: cleanedRecipients,
        subject,
        intro,
        ctaLabel,
        ctaUrl,
        details,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.warn("[Outsiders] Email send failed:", error?.error || response.status);
      return { skipped: false, sent: 0, failed: cleanedRecipients.length };
    }

    const result = await response.json();
    return { skipped: false, sent: result.sent || 0, failed: result.failed || 0 };
  } catch (err) {
    console.warn("[Outsiders] Email send error:", err?.message || err);
    return { skipped: false, sent: 0, failed: cleanedRecipients.length };
  }
}
