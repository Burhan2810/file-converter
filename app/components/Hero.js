"use client";

export default function Hero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "72px 24px 48px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
      className="animate-fade-in-up"
    >
      <h1
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: "20px",
          letterSpacing: "-0.03em",
        }}
      >
        Convert Any File,{" "}
        <span className="gradient-text">Instantly</span>
      </h1>
      <p
        style={{
          fontSize: "1.15rem",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          maxWidth: "520px",
          margin: "0 auto 28px",
        }}
      >
        No login. No ads. No waiting. Just drag, drop, and download.
        <br />
        <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Images • Documents • Audio — all formats supported.
        </span>
      </p>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {["JPG → PDF", "PNG → WEBP", "DOCX → PDF", "MP4 → MP3"].map(
          (tag, i) => (
            <span
              key={tag}
              style={{
                padding: "6px 16px",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 600,
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.25)",
                color: "#a78bfa",
                animationDelay: `${i * 0.1}s`,
              }}
              className="animate-fade-in"
            >
              {tag}
            </span>
          )
        )}
      </div>
    </section>
  );
}
