import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Emoji Archive",
  description: "Scan exhibit QR codes, save Emoji responses, and generate a personal museum visit summary.",
  manifest: "/manifest.webmanifest"
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
            <Link className="brand" href="/" aria-label="The Emoji Archive home">
              <span className="brand-mark">M</span>
              <span>The Emoji Archive</span>
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
