import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cyber-Sphere | Global Cyber Law Atlas",
  description:
    "Explore and compare cyber laws across countries on an interactive 3D globe. Side-by-side comparison of penalties, strictness scores, AI regulations, and draft bills worldwide.",
  keywords: [
    "cyber law",
    "cyber crime",
    "data privacy",
    "GDPR",
    "IT Act",
    "CFAA",
    "AI regulation",
    "global comparison",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100 font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
