import { createTryOnRequest, pollTryOnUntilSettled } from "./api";
import { createWidgetUi } from "./ui";

type WidgetConfig = {
  apiBase: string;
  apiKey: string;
  buttonText: string;
  buttonColor: string;
};

function getItemIdFromPage(): string | null {
  const explicitTarget = document.querySelector<HTMLElement>("[data-fitview-item]");
  return explicitTarget?.dataset.fitviewItem ?? null;
}

export function mountWidget(config: WidgetConfig) {
  const ui = createWidgetUi({
    texts: {
      buttonLabel: config.buttonText,
      title: "Try It On",
      subtitle: "Upload a photo and preview this item on you.",
      cta: "Generate your look"
    },
    theme: {
      buttonColor: config.buttonColor
    }
  });

  let selectedFile: File | null = null;

  const resetResultView = () => {
    ui.previewImage.removeAttribute("src");
    ui.previewImage.setAttribute("data-visible", "false");
    ui.downloadLink.removeAttribute("href");
    ui.downloadLink.style.display = "none";
    ui.retryButton.style.display = "none";
  };

  const showError = (message: string) => {
    ui.statusText.textContent = message;
    ui.statusText.style.color = "#fca5a5";
    ui.retryButton.style.display = "inline-flex";
  };

  const setProgress = (text: string) => {
    ui.statusText.textContent = text;
    ui.statusText.style.color = "#93c5fd";
  };

  const openModal = () => {
    ui.overlay.setAttribute("data-open", "true");
    ui.statusText.textContent = "";
    resetResultView();
  };

  const closeModal = () => {
    ui.overlay.setAttribute("data-open", "false");
  };

  ui.openButton.addEventListener("click", openModal);
  ui.closeButton.addEventListener("click", closeModal);
  ui.overlay.addEventListener("click", (event) => {
    if (event.target === ui.overlay) {
      closeModal();
    }
  });

  ui.fileInput.addEventListener("change", () => {
    const file = ui.fileInput.files?.[0] ?? null;
    selectedFile = file;
    ui.statusText.textContent = file ? `Selected: ${file.name}` : "";
  });

  ui.retryButton.addEventListener("click", () => {
    ui.statusText.textContent = "";
    ui.retryButton.style.display = "none";
    resetResultView();
  });

  ui.submitButton.addEventListener("click", async () => {
    const itemId = getItemIdFromPage();
    if (!itemId) {
      showError("Missing data-fitview-item attribute on the page.");
      return;
    }

    if (!selectedFile) {
      showError("Please upload a photo first.");
      return;
    }

    ui.submitButton.setAttribute("disabled", "true");
    setProgress("Uploading your photo...");

    try {
      const created = await createTryOnRequest({
        apiBase: config.apiBase,
        apiKey: config.apiKey,
        itemId,
        file: selectedFile
      });

      setProgress("Generating your look...");

      const settled = await pollTryOnUntilSettled({
        apiBase: config.apiBase,
        apiKey: config.apiKey,
        pollUrl: created.pollUrl,
        onProgress: () => {
          setProgress("Generating your look...");
        }
      });

      if ("error" in settled) {
        showError(settled.error);
        return;
      }

      if (settled.data.status === "FAILED") {
        showError(settled.data.errorMessage || "Generation failed. Please try again.");
        return;
      }

      if (settled.data.status === "COMPLETED") {
        setProgress("Done.");
        ui.previewImage.src = settled.data.resultImageUrl;
        ui.previewImage.setAttribute("data-visible", "true");
        ui.downloadLink.href = settled.data.resultImageUrl;
        ui.downloadLink.style.display = "inline-flex";
        ui.retryButton.style.display = "inline-flex";
      }
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : "Failed to process try-on";
      showError(fallbackMessage);
    } finally {
      ui.submitButton.removeAttribute("disabled");
    }
  });
}
