import "./globals.css";

export const metadata = {
  title: "FileForge — Free Online File Converter",
  description:
    "Convert images to PDF, JPEG to PNG, PPT to PDF, DOCX to PDF, and more — instantly and for free. No login, no ads, no hassle.",
  keywords: [
    "file converter",
    "image to pdf",
    "jpeg to png",
    "docx to pdf",
    "pptx to pdf",
    "free file converter",
    "online converter",
    "convert pdf",
    "convert audio",
    "mp4 to mp3",
    "png to webp",
  ],
  authors: [{ name: "FileForge" }],
  openGraph: {
    title: "FileForge — Free Online File Converter",
    description:
      "Convert any file format instantly — no login, no ads, no hassle. Images, documents, audio all supported.",
    type: "website",
    locale: "en_US",
    siteName: "FileForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "FileForge — Free Online File Converter",
    description:
      "Convert any file format instantly — no login, no ads, no hassle.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
