export async function sendNotificationEmails({
  recipients = [],
  subject = "",
  intro = "",
  ctaLabel = "Open Outsiders",
  ctaUrl = "",
  details = [],
}) {
  const cleanedRecipients = recipients
    .filter((recipient) => recipient?.email)
    .map((recipient) => ({
      email: String(recipient.email).trim(),
      name: String(recipient.name || "").trim(),
    }))
    .filter((recipient, index, list) => recipient.email && list.findIndex((item) => item.email.toLowerCase() === recipient.email.toLowerCase()) === index);

  if (!cleanedRecipients.length) return { skipped: true };

  const response = await fetch("/api/send-notification-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Email notifications could not be sent.");
  }

  return response.json().catch(() => ({ ok: true }));
}
