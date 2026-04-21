import { NextResponse } from "next/server";

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No image files provided" },
        { status: 400 }
      );
    }

    // Check each file size
    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Maximum allowed size is ${MAX_SIZE_MB}MB per file.` },
          { status: 413 }
        );
      }
    }

    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const type = file.type;

      let embeddedImage;
      if (type === "image/jpeg" || type === "image/jpg") {
        embeddedImage = await pdfDoc.embedJpg(buffer);
      } else if (type === "image/png") {
        embeddedImage = await pdfDoc.embedPng(buffer);
      } else {
        // Convert other formats to PNG via sharp first
        try {
          const sharp = (await import("sharp")).default;
          const pngBuffer = await sharp(buffer).png().toBuffer();
          embeddedImage = await pdfDoc.embedPng(pngBuffer);
        } catch {
          return NextResponse.json(
            { error: `Cannot process file: ${file.name}. Supported: JPEG, PNG, WEBP, GIF, BMP, TIFF, AVIF` },
            { status: 400 }
          );
        }
      }

      const { width, height } = embeddedImage;
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image to PDF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image(s) to PDF. Please try again." },
      { status: 500 }
    );
  }
}
