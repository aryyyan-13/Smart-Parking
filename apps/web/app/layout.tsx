import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PageTransition from "@web/components/layout/PageTransition";
import AuroraBackground from "@web/components/layout/AuroraBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Parking — Spatial 3D Parking Platform",
  description:
    "Discover available parking spaces near you. Book in seconds with our futuristic smart parking platform. Real-time availability, 3D interactive garage views, and AI vision telemetry.",
  keywords: ["parking", "smart parking", "book parking", "parking reservation", "parking near me", "EV charging"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-void text-foreground font-sans relative selection:bg-accent-cyan/30 selection:text-white">
        <AuroraBackground />
        <div className="relative z-10 flex-1 flex flex-col">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  );
}
