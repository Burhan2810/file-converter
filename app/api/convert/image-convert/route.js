import { NextResponse } from "next/server";

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const outputFormat = formData.get("outputFormat") || "png";

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const validFormats = ["png", "jpeg", "jpg", "webp", "avif"];
    const format = outputFormat.toLowerCase() === "jpg" ? "jpeg" : outputFormat.toLowerCase();

    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Unsupported output format: ${outputFormat}. Supported: PNG, JPEG, WEBP, AVIF` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sharp = (await import("sharp")).default;

    let pipeline = sharp(buffer);

    switch (format) {
      case "png":
        pipeline = pipeline.png({ quality: 90 });
        break;
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality: 85 });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: 70 });
        break;
    }

    const outputBuffer = await pipeline.toBuffer();

    const mimeMap = {
      png: "image/png",
      jpeg: "image/jpeg",
      webp: "image/webp",
      avif: "image/avif",
    };

    const originalName = file.name?.split(".")[0] || "converted";

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[format],
        "Content-Disposition": `attachment; filename="${originalName}.${format === "jpeg" ? "jpg" : format}"`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image. Please check the file and try again." },
      { status: 500 }
    );
  }
}
