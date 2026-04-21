"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ConverterCard from "./components/ConverterCard";
import DropZone from "./components/DropZone";
import ConversionPanel from "./components/ConversionPanel";
import { imagesToPdf, convertImage, mergePdfs } from "./lib/clientConverter";

const CONVERTERS = [
  {
    id: "img-to-pdf",
    icon: "📄",
    title: "Image → PDF",
    description: "Combine JPEG, PNG images into a single PDF document",
    badge: "Popular",
    gradient: "linear-gradient(135deg, #7c3aed, #db2777)",
    accentColor: "#7c3aed",
    category: "document",
    accept: "image/jpeg,image/png",
    fileTypes: ["JPG", "JPEG", "PNG"],
    apiEndpoint: "/api/convert/image-to-pdf",
    outputFormat: "PDF",
    outputFileName: "converted.pdf",
    outputMime: "application/pdf",
    fieldName: "files",
    multiple: true,
    maxFileSizeMb: 50,
    clientSide: "imagesToPdf",
  },
  {
    id: "img-convert",
    icon: "🖼️",
    title: "Image Convert",
    description: "Convert between JPEG, PNG, WEBP, and AVIF formats",
    badge: "Fast",
    gradient: "linear-gradient(135deg, #6366f1, #7c3aed)",
    accentColor: "#6366f1",
    category: "image",
    accept: "image/*",
    fileTypes: ["JPG", "PNG", "WEBP", "AVIF"],
    apiEndpoint: "/api/convert/image-convert",
    outputFormat: null, // user picks
    outputFileName: "converted",
    outputMime: null,
    fieldName: "file",
    multiple: false,
    hasOutputPicker: true,
    outputOptions: ["png", "jpeg", "webp", "avif"],
    maxFileSizeMb: 50,
    clientSide: "convertImage",
  },
  {
    id: "docx-to-pdf",
    icon: "📝",
    title: "DOCX → PDF",
    description: "Convert Word documents to PDF format instantly",
    badge: "Office",
    gradient: "linear-gradient(135deg, #06b6d4, #6366f1)",
    accentColor: "#06b6d4",
    category: "document",
    accept: ".docx,.doc",
    fileTypes: ["DOCX", "DOC"],
    apiEndpoint: "/api/convert/office-to-pdf",
    outputFormat: "PDF",
    outputFileName: "converted.pdf",
    outputMime: "application/pdf",
    fieldName: "file",
    multiple: false,
    maxFileSizeMb: 50,
  },
  {
    id: "xlsx-to-pdf",
    icon: "📊",
    title: "Excel → PDF",
    description: "Convert spreadsheets to clean PDF documents",
    badge: "Office",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    accentColor: "#10b981",
    category: "document",
    accept: ".xlsx,.xls,.csv",
    fileTypes: ["XLSX", "XLS", "CSV"],
    apiEndpoint: "/api/convert/office-to-pdf",
    outputFormat: "PDF",
    outputFileName: "converted.pdf",
    outputMime: "application/pdf",
    fieldName: "file",
    multiple: false,
    maxFileSizeMb: 50,
  },
  {
    id: "pptx-to-pdf",
    icon: "🎞️",
    title: "PPT → PDF",
    description: "Convert PowerPoint presentations to PDF format",
    badge: "University",
    gradient: "linear-gradient(135deg, #f97316, #eab308)",
    accentColor: "#f97316",
    category: "document",
    accept: ".pptx,.ppt",
    fileTypes: ["PPTX", "PPT"],
    apiEndpoint: "/api/convert/office-to-pdf",
    outputFormat: "PDF",
    outputFileName: "presentation.pdf",
    outputMime: "application/pdf",
    fieldName: "file",
    multiple: false,
    maxFileSizeMb: 50,
  },
  {
    id: "merge-pdf",
    icon: "📑",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single document",
    badge: "University",
    gradient: "linear-gradient(135deg, #7c3aed, #db2777)",
    accentColor: "#7c3aed",
    category: "document",
    accept: ".pdf",
    fileTypes: ["PDF"],
    apiEndpoint: "/api/convert/merge-pdf",
    outputFormat: "PDF",
    outputFileName: "merged.pdf",
    outputMime: "application/pdf",
    fieldName: "files",
    multiple: true,
    maxFileSizeMb: 50,
    clientSide: "mergePdfs",
  },
  {
    id: "pdf-to-img",
    icon: "🖼️",
    title: "PDF → Images",
    description: "Extract PDF pages as individual PNG or JPEG images",
    badge: "Extract",
    gradient: "linear-gradient(135deg, #db2777, #f97316)",
    accentColor: "#db2777",
    category: "image",
    accept: ".pdf",
    fileTypes: ["PDF"],
    apiEndpoint: "/api/convert/pdf-to-image",
    outputFormat: "PNG",
    outputFileName: "pages.zip",
    outputMime: "application/zip",
    fieldName: "file",
    multiple: false,
    maxFileSizeMb: 50,
  },
  {
    id: "audio-convert",
    icon: "🎵",
    title: "Audio Convert",
    description: "Convert between MP3, WAV, OGG, AAC, and FLAC",
    badge: "Audio",
    gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    accentColor: "#ec4899",
    category: "audio",
    accept: "audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a",
    fileTypes: ["MP3", "WAV", "OGG", "FLAC", "AAC"],
    apiEndpoint: "/api/convert/audio-convert",
    outputFormat: null,
    outputFileName: "converted",
    outputMime: null,
    fieldName: "file",
    multiple: false,
    hasOutputPicker: true,
    outputOptions: ["mp3", "wav", "ogg", "flac", "aac"],
    maxFileSizeMb: 200,
  },
  {
    id: "video-to-audio",
    icon: "🎬",
    title: "Video → Audio",
    description: "Extract audio from MP4, MOV, AVI, and other video formats",
    badge: "Extract",
    gradient: "linear-gradient(135deg, #14b8a6, #a855f7)",
    accentColor: "#14b8a6",
    category: "audio",
    accept: "video/*,.mp4,.mov,.avi,.mkv,.webm",
    fileTypes: ["MP4", "MOV", "AVI", "MKV", "WEBM"],
    apiEndpoint: "/api/convert/audio-convert",
    outputFormat: null,
    outputFileName: "extracted",
    outputMime: null,
    fieldName: "file",
    multiple: false,
    hasOutputPicker: true,
    outputOptions: ["mp3", "wav", "ogg"],
    maxFileSizeMb: 200,
  },
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | converting | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [chosenOutput, setChosenOutput] = useState(null);

  const converter = CONVERTERS.find((c) => c.id === selected);

  const handleSelectConverter = (id) => {
    setSelected(id);
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
    setDownloadUrl(null);
    const conv = CONVERTERS.find((c) => c.id === id);
    if (conv?.hasOutputPicker && conv.outputOptions?.length) {
      setChosenOutput(conv.outputOptions[0]);
    } else {
      setChosenOutput(null);
    }
  };

  const handleFilesSelected = (newFiles) => {
    setErrorMsg("");
    setStatus("idle");
    if (converter?.multiple) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  };

  const handleDropZoneError = (msg) => {
    setErrorMsg(msg);
    setStatus("error");
  };

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
    setDownloadUrl(null);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!converter || files.length === 0) return;

    setStatus("converting");
    setErrorMsg("");
    setDownloadUrl(null);

    try {
      let blob;

      // ─── Client-side conversion (no server upload needed) ───
      if (converter.clientSide) {
        switch (converter.clientSide) {
          case "imagesToPdf":
            blob = await imagesToPdf(files);
            break;
          case "convertImage":
            blob = await convertImage(files[0], chosenOutput || "png");
            break;
          case "mergePdfs":
            blob = await mergePdfs(files);
            break;
          default:
            throw new Error("Unknown client converter");
        }
      } else {
        // ─── Server-side conversion (audio, video, office docs) ───
        const formData = new FormData();
        if (converter.multiple) {
          files.forEach((f) => formData.append(converter.fieldName, f));
        } else {
          formData.append(converter.fieldName, files[0]);
        }

        if (chosenOutput) {
          formData.append("outputFormat", chosenOutput);
        }

        const res = await fetch(converter.apiEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Conversion failed (${res.status})`);
        }

        blob = await res.blob();
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;

    // Build a meaningful filename from the original uploaded file
    const originalName = files[0]?.name || "converted";
    const baseName = originalName.includes(".")
      ? originalName.substring(0, originalName.lastIndexOf("."))
      : originalName;

    let ext;
    if (chosenOutput) {
      ext = chosenOutput;
    } else if (converter?.outputFileName && converter.outputFileName !== "converted") {
      // Use the full outputFileName if it's specific (e.g. "merged.pdf", "pages.zip")
      a.download = converter.outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } else {
      ext = converter?.outputFormat?.toLowerCase() || "file";
    }

    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Navbar />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />

        <div className="page-content" style={{ paddingBottom: "80px" }}>
          {/* Converter Selection */}
          {!selected && (
            <div className="animate-fade-in-up">
              {/* Documents */}
              <div className="section-label">📁 Documents</div>
              <div className="converter-grid" style={{ marginBottom: "32px" }}>
                {CONVERTERS.filter((c) => c.category === "document").map(
                  (conv) => (
                    <ConverterCard
                      key={conv.id}
                      icon={conv.icon}
                      title={conv.title}
                      description={conv.description}
                      badge={conv.badge}
                      gradient={conv.gradient}
                      accentColor={conv.accentColor}
                      active={selected === conv.id}
                      onClick={() => handleSelectConverter(conv.id)}
                    />
                  )
                )}
              </div>

              {/* Images */}
              <div className="section-label">🖼️ Images</div>
              <div className="converter-grid" style={{ marginBottom: "32px" }}>
                {CONVERTERS.filter((c) => c.category === "image").map(
                  (conv) => (
                    <ConverterCard
                      key={conv.id}
                      icon={conv.icon}
                      title={conv.title}
                      description={conv.description}
                      badge={conv.badge}
                      gradient={conv.gradient}
                      accentColor={conv.accentColor}
                      active={selected === conv.id}
                      onClick={() => handleSelectConverter(conv.id)}
                    />
                  )
                )}
              </div>

              {/* Audio */}
              <div className="section-label">🎵 Audio & Video</div>
              <div className="converter-grid">
                {CONVERTERS.filter((c) => c.category === "audio").map(
                  (conv) => (
                    <ConverterCard
                      key={conv.id}
                      icon={conv.icon}
                      title={conv.title}
                      description={conv.description}
                      badge={conv.badge}
                      gradient={conv.gradient}
                      accentColor={conv.accentColor}
                      active={selected === conv.id}
                      onClick={() => handleSelectConverter(conv.id)}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Active Converter */}
          {selected && converter && (
            <div className="animate-fade-in-up">
              <button
                className="btn-secondary"
                onClick={() => handleSelectConverter(null) || setSelected(null)}
                style={{ marginBottom: "24px" }}
              >
                ← Back to all converters
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: converter.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                  }}
                >
                  {converter.icon}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                    }}
                  >
                    {converter.title}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {converter.description}
                  </p>
                </div>
              </div>

              <div className="main-layout">
                <div>
                  {/* Output picker */}
                  {converter.hasOutputPicker && (
                    <div
                      className="glass-card"
                      style={{ padding: "20px", marginBottom: "16px" }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: "12px",
                        }}
                      >
                        Output Format
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {converter.outputOptions.map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setChosenOutput(fmt)}
                            style={{
                              padding: "8px 18px",
                              borderRadius: "10px",
                              border:
                                chosenOutput === fmt
                                  ? `2px solid ${converter.accentColor}`
                                  : "1px solid var(--border-glass)",
                              background:
                                chosenOutput === fmt
                                  ? `${converter.accentColor}22`
                                  : "transparent",
                              color:
                                chosenOutput === fmt
                                  ? converter.accentColor
                                  : "var(--text-secondary)",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            .{fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drop Zone */}
                  {(status === "idle" || status === "error") && (
                    <DropZone
                      accept={converter.accept}
                      fileTypes={converter.fileTypes}
                      onFilesSelected={handleFilesSelected}
                      onError={handleDropZoneError}
                      multiple={converter.multiple}
                      maxFileSizeMb={converter.maxFileSizeMb || 50}
                    />
                  )}
                </div>

                <ConversionPanel
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  status={status}
                  progress={null}
                  errorMessage={errorMsg}
                  onConvert={handleConvert}
                  onDownload={handleDownload}
                  onReset={handleReset}
                  convertLabel={`Convert to ${
                    chosenOutput?.toUpperCase() ||
                    converter.outputFormat ||
                    "File"
                  }`}
                  downloadFileName={
                    chosenOutput
                      ? `${files[0]?.name?.split(".")[0] || "file"}.${chosenOutput}`
                      : converter.outputFileName
                  }
                  outputFormat={
                    chosenOutput?.toUpperCase() || converter.outputFormat
                  }
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "32px 24px",
          borderTop: "1px solid var(--border-glass)",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
        }}
      >
        <p>
          <strong style={{ color: "var(--text-secondary)" }}>FileForge</strong>{" "}
          — Free, fast, no-login file converter. Built with ❤️
        </p>
        <p style={{ marginTop: "6px", fontSize: "0.75rem" }}>
          Your files are processed on the server and never stored.
        </p>
      </footer>
    </>
  );
}