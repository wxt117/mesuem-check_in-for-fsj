import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import archiveIcon from "@/assets/icons/icon.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE EMOJI ARCHIVE",
  description: "Scan exhibit QR codes, save Emoji responses, and generate a personal museum visit summary.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/emoji-archive-icon.png",
    apple: "/emoji-archive-icon.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#157a7e"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <Link className="brand" href="/" aria-label="THE EMOJI ARCHIVE home">
              <span className="brand-mark" aria-hidden="true">
                <Image src={archiveIcon} alt="" width={36} height={36} className="brand-icon" priority />
              </span>
              <span>THE EMOJI ARCHIVE</span>
            </Link>
            <nav className="nav-actions" aria-label="Primary navigation">
              <Link className="icon-link" href="/" title="Check-ins" aria-label="Check-ins">
                <Home size={19} />
              </Link>
              <Link className="icon-link" href="/summary" title="Summary" aria-label="Summary">
                <Sparkles size={19} />
              </Link>
            </nav>
          </header>
          <main className="app">{children}</main>
        </div>
      </body>
    </html>
  );
}
