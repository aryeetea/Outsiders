export async function copyTextWithAlert(text, successMessage = "Copied to clipboard.") {
  const value = String(text || "").trim();
  if (!value) {
    throw new Error("Nothing to copy.");
  }

  try {
    if (window.navigator?.clipboard && window.isSecureContext) {
      await window.navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) {
        throw new Error("Clipboard copy was blocked.");
      }
    }

    window.dispatchEvent(new CustomEvent("outsiders:toast", {
      detail: {
        message: successMessage,
        tone: "success",
        duration: 1100,
      },
    }));
    return true;
  } catch (error) {
    window.dispatchEvent(new CustomEvent("outsiders:toast", {
      detail: {
        message: error?.message || "We could not copy that just yet.",
        tone: "error",
        duration: 1500,
      },
    }));
    return false;
  }
}
