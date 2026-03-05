(function bootstrapFitViewWidget() {
  const scriptTag = document.currentScript as HTMLScriptElement | null;
  if (!scriptTag) {
    return;
  }

  const apiKey = scriptTag.getAttribute("data-api-key");
  if (!apiKey) {
    console.error("[FitView] Missing data-api-key attribute.");
    return;
  }

  const apiBase = scriptTag.getAttribute("data-api-base") ?? "https://app.fitview.ai/api/public";
  const buttonText = scriptTag.getAttribute("data-button-text") ?? "Try it on";
  const buttonColor = scriptTag.getAttribute("data-button-color") ?? "#2563eb";

  import("./widget")
    .then(({ mountWidget }) => {
      mountWidget({
        apiBase,
        apiKey,
        buttonText,
        buttonColor
      });
    })
    .catch((error) => {
      console.error("[FitView] Failed to mount widget.", error);
    });
})();
