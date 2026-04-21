import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const execAsync = promisify(exec);

export async function POST(request) {
  let tempDir = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const outputFormat = (formData.get("outputFormat") || "mp3").toLowerCase();

    if (!file) {
      return NextResponse.json(
        { error: "No audio/video file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const validFormats = ["mp3", "wav", "ogg", "flac", "aac"];
    if (!validFormats.includes(outputFormat)) {
      return NextResponse.json(
        { error: `Unsupported output format: ${outputFormat}. Supported: MP3, WAV, OGG, FLAC, AAC` },
        { status: 400 }
      );
    }

    // Check if ffmpeg is available
    try {
      await execAsync("which ffmpeg");
    } catch {
      return NextResponse.json(
        { error: "FFmpeg is not available on this server. Audio conversion requires FFmpeg." },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create temp directory
    tempDir = await mkdtemp(path.join(tmpdir(), "fileforge-"));
    const inputExt = file.name?.split(".").pop() || "input";
    const inputPath = path.join(tempDir, `input.${inputExt}`);
    const outputPath = path.join(tempDir, `output.${outputFormat}`);

    await writeFile(inputPath, buffer);

    // Build ffmpeg command
    let ffmpegArgs = `-i "${inputPath}" -y`;

    switch (outputFormat) {
      case "mp3":
        ffmpegArgs += " -codec:a libmp3lame -b:a 192k";
        break;
      case "wav":
        ffmpegArgs += " -codec:a pcm_s16le";
        break;
      case "ogg":
        ffmpegArgs += " -codec:a libvorbis -b:a 192k";
        break;
      case "flac":
        ffmpegArgs += " -codec:a flac";
        break;
      case "aac":
        ffmpegArgs += " -codec:a aac -b:a 192k";
        break;
    }

    ffmpegArgs += ` "${outputPath}"`;

    // Run ffmpeg with timeout
    await execAsync(`ffmpeg ${ffmpegArgs}`, { timeout: 120000 });

    const outputBuffer = await readFile(outputPath);

    // Clean up
    try {
      await unlink(inputPath);
      await unlink(outputPath);
    } catch {}

    const mimeMap = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      flac: "audio/flac",
      aac: "audio/aac",
    };

    const originalName = file.name?.split(".")[0] || "converted";

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[outputFormat] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${originalName}.${outputFormat}"`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Audio conversion error:", error);

    const msg = error.message || "";
    if (msg.includes("SIGTERM") || msg.includes("timeout")) {
      return NextResponse.json(
        { error: "Conversion timed out. Try a smaller file (under 50MB)." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to convert audio/video. Make sure the file is a valid audio or video format.",
      },
      { status: 500 }
    );
  }
}
