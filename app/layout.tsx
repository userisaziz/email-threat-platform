import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmailThreat — Forensic Intelligence Platform",
  description: "AI-powered email phishing detection and forensic analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="text-red-500 font-bold text-lg tracking-tight">
              ⚠ EmailThreat
            </a>
            <span className="text-gray-600 text-sm hidden sm:block">
              Forensic Intelligence Platform
            </span>
            <nav className="ml-auto flex gap-4 text-sm">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Analyze
              </a>
              <a href="/campaigns" className="text-gray-400 hover:text-white transition-colors">
                Campaigns
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
