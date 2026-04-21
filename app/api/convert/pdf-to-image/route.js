import { NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request) {
  let tmpDir = null;
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temp dir for this request
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pdf-img-"));

    const inputPath = path.join(tmpDir, "input.pdf");
    await fs.promises.writeFile(inputPath, buffer);

    // Use Ghostscript to render each PDF page as a PNG at 150 DPI
    // Output files will be named: page-001.png, page-002.png, ...
    const outputPattern = path.join(tmpDir, "page-%03d.png");

    await execFileAsync(
      "gs",
      [
        "-dNOPAUSE",
        "-dBATCH",
        "-dSAFER",
        "-sDEVICE=png16m",       // 24-bit full colour PNG
        "-r150",                  // 150 DPI — good balance quality/size
        "-dTextAlphaBits=4",      // anti-aliasing for text
        "-dGraphicsAlphaBits=4",  // anti-aliasing for graphics
        `-sOutputFile=${outputPattern}`,
        inputPath,
      ],
      { timeout: 120000 }
    );

    // Collect all generated page images (sorted)
    const allFiles = await fs.promises.readdir(tmpDir);
    const pageFiles = allFiles
      .filter((f) => f.startsWith("page-") && f.endsWith(".png"))
      .sort();

    if (pageFiles.length === 0) {
      throw new Error("Ghostscript did not produce any output images.");
    }

    // Single page → return the PNG directly
    if (pageFiles.length === 1) {
      const pngBuffer = await fs.promises.readFile(path.join(tmpDir, pageFiles[0]));

      return new NextResponse(pngBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": 'attachment; filename="page-1.png"',
          "Content-Length": pngBuffer.length.toString(),
        },
      });
    }

    // Multi-page → bundle into a ZIP
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip();

    for (const pageFile of pageFiles) {
      const pngBuffer = await fs.promises.readFile(path.join(tmpDir, pageFile));
      zip.addFile(pageFile, pngBuffer);
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pages.zip"',
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF to image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert PDF to images. Please make sure the file is a valid PDF." },
      { status: 500 }
    );
  } finally {
    // Always clean up temp dir
    if (tmpDir) {
      fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
    }
  }
}
