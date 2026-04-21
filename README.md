# FileForge — Free Online File Converter

> Convert any file, instantly. No login. No ads. No waiting.

FileForge is a fast, beautiful, open-source file converter that runs entirely in your browser + server. Built with Next.js, it handles images, documents, and audio conversions — all for free.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render)](https://fileforge.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## Features

- **Image to PDF** — Combine JPEG/PNG images into a single PDF
- **Image Convert** — Convert between JPEG, PNG, WEBP, AVIF
- **Merge PDF** — Combine multiple PDF files into one
- **DOCX to PDF** — Word documents to PDF
- **Excel/CSV to PDF** — Spreadsheets to PDF
- **PPT to PDF** — PowerPoint presentations to PDF
- **PDF to Images** — Extract PDF pages as PNG images
- **Audio Convert** — MP3, WAV, OGG, FLAC, AAC format swaps
- **Video to Audio** — Extract MP3/WAV from MP4, MOV, AVI

## Why FileForge?

Most online converters are slow, ad-filled, require login, or have file size limits. FileForge is:
- **No login required** — just drag, drop, download
- **No file storage** — files are processed in memory and never saved
- **Fast** — conversions run server-side using native Node.js libraries
- **Open source** — free to use, fork, and self-host

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Styling | Vanilla CSS (dark glassmorphism) |
| PDF creation | [pdf-lib](https://pdf-lib.js.org) |
| Image processing | [sharp](https://sharp.pixelplumbing.com) |
| DOCX parsing | [mammoth](https://github.com/mwilliamson/mammoth.js) |
| PPTX parsing | [adm-zip](https://github.com/cthackers/adm-zip) (XML extraction) |
| Audio/Video | [FFmpeg](https://ffmpeg.org) via shell |
| Deployment | [Render](https://render.com) (Docker, free tier) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- FFmpeg installed on your system (for audio conversions)
- LibreOffice (for document conversions)
- Ghostscript (for PDF-to-image conversions)

### Installation

```bash
# Clone the repository
git clone https://github.com/Burhan2810/file-converter.git
cd file-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
file-converter/
├── app/
│   ├── api/
│   │   └── convert/
│   │       ├── image-to-pdf/     # Image to PDF (pdf-lib + sharp)
│   │       ├── image-convert/    # Image format swap (sharp)
│   │       ├── office-to-pdf/    # DOCX/PPTX/CSV to PDF (LibreOffice)
│   │       ├── merge-pdf/        # Merge multiple PDFs (pdf-lib)
│   │       ├── pdf-to-image/     # PDF pages to PNG (pdf-lib + sharp)
│   │       └── audio-convert/    # Audio/video conversion (FFmpeg)
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Hero.js
│   │   ├── ConverterCard.js
│   │   ├── DropZone.js
│   │   └── ConversionPanel.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── Dockerfile
├── render.yaml
└── package.json
```

---

## Deploy Your Own

### Render (Recommended — Free Tier with Full Feature Support)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Burhan2810/file-converter)

1. Click the button above or go to [render.com](https://render.com)
2. Sign up / log in with your GitHub account
3. Click **"New +"** → **"Web Service"**
4. Connect your `file-converter` repository
5. Render auto-detects the Dockerfile — select **Free** instance type
6. Click **"Deploy Web Service"** and wait ~5-10 minutes for the build

> Render supports Docker, so **all features work** including LibreOffice (DOCX/PPTX/XLSX to PDF), Ghostscript (PDF to Image), and FFmpeg (audio/video).

> **Free tier note:** The app sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to cold-start.

### Alternative Platforms

| Platform | Docker | All Features | Free Tier |
|----------|--------|-------------|-----------|
| [Render](https://render.com) | Yes | Yes | Free (with sleep) |
| [Fly.io](https://fly.io) | Yes | Yes | Generous free tier |
| [Railway](https://railway.app) | Yes | Yes | $5/mo credits |
| [Vercel](https://vercel.com) | No | Partial | Free |

> **Note:** Vercel is serverless and cannot install system dependencies (LibreOffice, Ghostscript, FFmpeg). Only image-to-PDF, image-convert, and merge-pdf features will work on Vercel.

---

## Contributing

Contributions are welcome! Feel free to:
- Open an issue for bugs or feature requests
- Submit a pull request with improvements
- Star the repo if you find it useful

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built using these open-source libraries:
- [pdf-lib](https://pdf-lib.js.org) — PDF creation and modification
- [sharp](https://sharp.pixelplumbing.com) — High-performance image processing
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) — DOCX to text extraction
- [FFmpeg](https://ffmpeg.org) — Audio and video processing

---

*Your files are processed on the server and are never stored or logged.*
