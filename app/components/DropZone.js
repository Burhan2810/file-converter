"use client";

import { useState, useRef } from "react";

export default function DropZone({ accept, fileTypes, onFilesSelected, onError, multiple = true, maxFileSizeMb = 50 }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const validateAndSelect = (files) => {
    const oversized = files.find((f) => f.size > maxFileSizeMb * 1024 * 1024);
    if (oversized) {
      onError?.(
        `"${oversized.name}" is too large (${(oversized.size / 1024 / 1024).toFixed(1)} MB). Maximum size is ${maxFileSizeMb} MB.`
      );
      return;
    }
    onFilesSelected?.(files);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) validateAndSelect(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) validateAndSelect(files);
  };

  return (
    <div
      className={`drop-zone${dragOver ? " drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <div className="drop-zone-icon">
        {dragOver ? "📂" : "☁️"}
      </div>
      <h3>{dragOver ? "Drop it here!" : "Drag & drop your files"}</h3>
      <p>or click to browse from your device</p>
      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
        Max {maxFileSizeMb} MB per file
      </p>
      {fileTypes && (
        <div className="file-types">
          {fileTypes.map((ft) => (
            <span key={ft} className="file-type-badge">
              {ft}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
