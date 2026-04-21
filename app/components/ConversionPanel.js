"use client";

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileIcon(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  const map = {
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️", bmp: "🖼️",
    svg: "🖼️", tiff: "🖼️", avif: "🖼️",
    pdf: "📄",
    doc: "📝", docx: "📝",
    ppt: "📊", pptx: "📊",
    xls: "📊", xlsx: "📊",
    mp3: "🎵", wav: "🎵", ogg: "🎵", flac: "🎵", aac: "🎵",
    mp4: "🎬", mov: "🎬", avi: "🎬", mkv: "🎬", webm: "🎬",
    md: "📑", html: "🌐", txt: "📃",
  };
  return map[ext] || "📎";
}

export default function ConversionPanel({
  files,
  onRemoveFile,
  status, // 'idle' | 'converting' | 'done' | 'error'
  progress, // 0-100 or null for indeterminate
  errorMessage,
  onConvert,
  onDownload,
  onReset,
  convertLabel = "Convert",
  downloadFileName,
  disabled,
  outputFormat,
}) {
  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      {/* File list */}
      {files && files.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
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
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </div>
          {files.map((file, i) => (
            <div className="file-pill" key={`${file.name}-${i}`}>
              <span className="file-icon">{fileIcon(file.name)}</span>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatSize(file.size)}</div>
              </div>
              {status === "idle" && (
                <button
                  className="remove-btn"
                  onClick={() => onRemoveFile?.(i)}
                  title="Remove file"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Output format display */}
      {outputFormat && status === "idle" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            padding: "12px 16px",
            background: "rgba(124, 58, 237, 0.08)",
            borderRadius: "12px",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Output format:
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#a78bfa",
              textTransform: "uppercase",
            }}
          >
            {outputFormat}
          </span>
        </div>
      )}

      {/* Status */}
      {status === "converting" && (
        <div style={{ marginBottom: "16px" }}>
          <div className="status-badge converting">
            <span className="status-dot"></span>
            Converting...
          </div>
          <div className="progress-bar-wrap">
            <div
              className={`progress-bar-fill${progress == null ? " indeterminate" : ""}`}
              style={{ width: progress != null ? `${progress}%` : undefined }}
            ></div>
          </div>
        </div>
      )}

      {status === "done" && (
        <div style={{ marginBottom: "16px" }}>
          <div className="status-badge success">
            <span className="status-dot"></span>
            Conversion complete!
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ marginBottom: "16px" }}>
          <div className="status-badge error">
            <span className="status-dot"></span>
            {errorMessage || "Conversion failed"}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {status === "idle" && files && files.length > 0 && (
          <button
            className="btn-primary"
            onClick={onConvert}
            disabled={disabled || !files.length}
          >
            {disabled ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              <>⚡ {convertLabel}</>
            )}
          </button>
        )}

        {status === "converting" && (
          <button className="btn-primary" disabled>
            <span className="spinner"></span> Converting...
          </button>
        )}

        {status === "done" && (
          <button className="btn-download" onClick={onDownload}>
            ⬇️ Download {downloadFileName || "File"}
          </button>
        )}

        {(status === "done" || status === "error") && (
          <button
            className="btn-secondary"
            onClick={onReset || (() => window.location.reload())}
          >
            🔄 {status === "error" ? "Try Again" : "Convert Another"}
          </button>
        )}
      </div>
    </div>
  );
}
