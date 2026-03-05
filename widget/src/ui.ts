export type WidgetTexts = {
  buttonLabel: string;
  title: string;
  subtitle: string;
  cta: string;
};

export type WidgetTheme = {
  buttonColor: string;
};

export type WidgetElements = {
  host: HTMLDivElement;
  root: HTMLDivElement;
  openButton: HTMLButtonElement;
  closeButton: HTMLButtonElement;
  dropzone: HTMLLabelElement;
  fileInput: HTMLInputElement;
  submitButton: HTMLButtonElement;
  retryButton: HTMLButtonElement;
  downloadLink: HTMLAnchorElement;
  statusText: HTMLParagraphElement;
  previewImage: HTMLImageElement;
  overlay: HTMLDivElement;
};

export function createWidgetUi(config: {
  texts: WidgetTexts;
  theme: WidgetTheme;
}): WidgetElements {
  const host = document.createElement("div");
  host.id = "fitview-widget-host";
  const shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .fitview-open {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483000;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      color: #fff;
      cursor: pointer;
      font: 600 14px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: ${config.theme.buttonColor};
      box-shadow: 0 12px 26px rgba(15, 23, 42, 0.35);
    }

    .fitview-overlay {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.64);
      display: none;
      z-index: 2147483001;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .fitview-overlay[data-open="true"] { display: flex; }

    .fitview-modal {
      width: min(520px, 100%);
      border-radius: 18px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .fitview-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
    }
    .fitview-title { margin: 0; font-size: 18px; font-weight: 700; }
    .fitview-subtitle { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }

    .fitview-close {
      background: transparent;
      color: #cbd5e1;
      border: 0;
      cursor: pointer;
      font-size: 16px;
    }

    .fitview-dropzone {
      margin-top: 16px;
      border: 1px dashed #475569;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      display: block;
      cursor: pointer;
      font-size: 13px;
      color: #cbd5e1;
    }

    .fitview-actions {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .fitview-btn {
      border-radius: 10px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #e2e8f0;
      padding: 10px 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-height: 40px;
    }

    .fitview-btn[data-primary="true"] {
      border-color: transparent;
      background: ${config.theme.buttonColor};
      color: #fff;
    }

    .fitview-status {
      margin: 12px 0 0;
      font-size: 13px;
      color: #93c5fd;
      min-height: 18px;
    }

    .fitview-result {
      margin-top: 14px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
      background: #020617;
      aspect-ratio: 3 / 4;
      display: grid;
      place-items: center;
    }

    .fitview-result img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: none;
    }

    .fitview-result img[data-visible="true"] { display: block; }
  `;

  const openButton = document.createElement("button");
  openButton.className = "fitview-open";
  openButton.textContent = config.texts.buttonLabel;

  const overlay = document.createElement("div");
  overlay.className = "fitview-overlay";
  overlay.setAttribute("data-open", "false");

  const modal = document.createElement("div");
  modal.className = "fitview-modal";

  const header = document.createElement("div");
  header.className = "fitview-header";

  const heading = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "fitview-title";
  title.textContent = config.texts.title;
  const subtitle = document.createElement("p");
  subtitle.className = "fitview-subtitle";
  subtitle.textContent = config.texts.subtitle;
  heading.append(title, subtitle);

  const closeButton = document.createElement("button");
  closeButton.className = "fitview-close";
  closeButton.textContent = "✕";
  closeButton.setAttribute("aria-label", "Close");

  header.append(heading, closeButton);

  const dropzone = document.createElement("label");
  dropzone.className = "fitview-dropzone";
  dropzone.textContent = "Drop your photo here or tap to upload";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/jpeg,image/png,image/webp";
  fileInput.capture = "user";
  fileInput.hidden = true;
  dropzone.append(fileInput);

  const statusText = document.createElement("p");
  statusText.className = "fitview-status";
  statusText.textContent = "";

  const resultBox = document.createElement("div");
  resultBox.className = "fitview-result";
  const previewImage = document.createElement("img");
  previewImage.alt = "FitView result";
  previewImage.setAttribute("data-visible", "false");
  resultBox.append(previewImage);

  const actions = document.createElement("div");
  actions.className = "fitview-actions";

  const submitButton = document.createElement("button");
  submitButton.className = "fitview-btn";
  submitButton.setAttribute("data-primary", "true");
  submitButton.textContent = config.texts.cta;

  const retryButton = document.createElement("button");
  retryButton.className = "fitview-btn";
  retryButton.textContent = "Try another photo";
  retryButton.style.display = "none";

  const downloadLink = document.createElement("a");
  downloadLink.className = "fitview-btn";
  downloadLink.textContent = "Download";
  downloadLink.target = "_blank";
  downloadLink.rel = "noopener noreferrer";
  downloadLink.style.display = "none";

  actions.append(submitButton, retryButton, downloadLink);

  modal.append(header, dropzone, statusText, resultBox, actions);
  overlay.append(modal);

  shadow.append(style, openButton, overlay);
  document.body.append(host);

  return {
    host,
    root: modal,
    openButton,
    closeButton,
    dropzone,
    fileInput,
    submitButton,
    retryButton,
    downloadLink,
    statusText,
    previewImage,
    overlay
  };
}
