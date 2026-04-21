import { NextResponse } from "next/server";

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "Please select at least 2 PDF files to merge." },
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
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Merge PDF error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDF files. Please make sure they are valid PDFs." },
      { status: 500 }
    );
  }
}
