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
        { error: "No document file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const fileName = file.name?.toLowerCase() || "";
    const ext = path.extname(fileName);

    const supported = [".docx", ".doc", ".xlsx", ".xls", ".csv", ".pptx", ".ppt", ".odt", ".ods", ".odp"];
    if (!supported.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file format. Supported: DOCX, DOC, XLSX, XLS, CSV, PPTX, PPT, ODT, ODS, ODP" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create isolated temp dir per request (avoids LibreOffice lock conflicts)
    tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "office-pdf-"));

    const inputFileName = `input${ext}`;
    const inputPath = path.join(tmpDir, inputFileName);
    await fs.promises.writeFile(inputPath, buffer);

    // LibreOffice headless — preserves full layout, images, colours, formatting
    await execFileAsync(
      "libreoffice",
      [
        "--headless",
        "--norestore",
        "--nofirststartwizard",
        "--convert-to", "pdf",
        "--outdir", tmpDir,
        inputPath,
      ],
      {
        timeout: 90000,
        env: {
          ...process.env,
          // Use a per-request user profile to avoid lock conflicts
          HOME: tmpDir,
        },
      }
    );

    // LibreOffice names the output after the input file (input.pdf)
    const outputPath = path.join(tmpDir, "input.pdf");

    if (!fs.existsSync(outputPath)) {
      throw new Error("LibreOffice did not produce an output file.");
    }

    const pdfBytes = await fs.promises.readFile(outputPath);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Office to PDF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert document to PDF. Please ensure the file is valid and try again." },
      { status: 500 }
    );
  } finally {
    // Always clean up temp dir
    if (tmpDir) {
      fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
    }
  }
}
