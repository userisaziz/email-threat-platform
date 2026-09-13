import type { Metadata } from "next";
import "./globals.css";
import { ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "EmailThreat — Forensic Intelligence Platform",
  description: "AI-powered email phishing detection and forensic analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-red-500 font-bold text-lg tracking-tight hover:text-red-400 transition-colors">
              <ShieldAlert className="w-5 h-5" />
              EmailThreat
            </a>
            <span className="text-gray-700 text-sm hidden sm:block">Forensic Intelligence Platform</span>
            <nav className="ml-auto flex items-center gap-1 text-sm">
              <a href="/" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                Analyze
              </a>
              <a href="/campaigns" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                Campaigns
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-600">
            <span>EmailThreat — SIH 2026 PS 26106</span>
            <span>AI-Powered Email Forensics</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
