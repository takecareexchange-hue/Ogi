import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ogi - AI-Powered Clinical Intelligence Platform",
  description:
    "Transform your independent practice with AI-powered clinical intelligence. Automate patient screening, generate provider-approved wellness reports, and grow your practice.",
  icons: {
    icon: "/brand/ogi-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white antialiased">{children}</body>
    </html>
  );
}