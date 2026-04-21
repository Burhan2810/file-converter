import { PDFDocument } from "pdf-lib";

// ─── Helpers ────────────────────────────────────────────────

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

async function fileToImage(file) {
  const dataUrl = await fileToDataUrl(file);
  return loadImage(dataUrl);
}

// Convert any image file to PNG bytes via Canvas (for formats pdf-lib can't embed directly)
async function imageToPngBytes(file) {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas to PNG failed"))),
      "image/png"
    );
  });
  const arrBuf = await blob.arrayBuffer();
  return new Uint8Array(arrBuf);
}

// ─── Image → PDF (client-side) ──────────────────────────────

export async function imagesToPdf(files) {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await fileToArrayBuffer(file);
    const uint8 = new Uint8Array(arrayBuffer);
    const type = file.type?.toLowerCase() || "";

    let embeddedImage;

    try {
      if (type === "image/jpeg" || type === "image/jpg") {
        embeddedImage = await pdfDoc.embedJpg(uint8);
      } else if (type === "image/png") {
        embeddedImage = await pdfDoc.embedPng(uint8);
      } else {
        // WEBP, AVIF, GIF, BMP, TIFF, etc. → convert to PNG via Canvas first
        const pngBytes = await imageToPngBytes(file);
        embeddedImage = await pdfDoc.embedPng(pngBytes);
      }
    } catch (embedErr) {
      // Some JPEGs/PNGs might be in unusual formats (CMYK, progressive, etc.)
      // Fall back to Canvas re-encode
      try {
        const pngBytes = await imageToPngBytes(file);
        embeddedImage = await pdfDoc.embedPng(pngBytes);
      } catch {
        throw new Error(
          `Cannot process "${file.name}". The image may be corrupted or in an unsupported format.`
        );
      }
    }

    const { width, height } = embeddedImage;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

// ─── Image Format Conversion (client-side via Canvas) ───────

export async function convertImage(file, outputFormat) {
  const img = await fileToImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");

  // For JPEG output, fill white background (no alpha)
  if (outputFormat === "jpeg" || outputFormat === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeMap = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
  };

  const qualityMap = {
    png: undefined,
    jpeg: 0.92,
    jpg: 0.92,
    webp: 0.88,
    avif: 0.75,
  };

  const mime = mimeMap[outputFormat] || "image/png";
  const quality = qualityMap[outputFormat];

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b && b.size > 0) {
          resolve(b);
        } else {
          reject(
            new Error(
              `Your browser doesn't support exporting to ${outputFormat.toUpperCase()} format. Try a different output format.`
            )
          );
        }
      },
      mime,
      quality
    );
  });

  return blob;
}

// ─── Merge PDFs (client-side) ───────────────────────────────

export async function mergePdfs(files) {
  if (files.length < 2) {
    throw new Error("Please select at least 2 PDF files to merge.");
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await fileToArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const copiedPages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      throw new Error(
        `Failed to process "${file.name}": ${err.message || "Invalid or encrypted PDF"}`
      );
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
