export async function sendNotificationEmails({
  recipients = [],
}) {
  const cleanedRecipients = (recipients || []).filter((recipient) => recipient?.email);
  return {
    skipped: true,
    reason: "email-disabled",
    recipients: cleanedRecipients.length,
  };
}
