import type { Metadata } from "next";

import { getSiteContent } from "@/lib/content";

import "./globals.css";

const site = getSiteContent();

export const metadata: Metadata = {
  metadataBase: new URL(site.site.link || "https://example.com"),
  title: site.site.title || "YS Clinic",
  description: site.site.description || "Premium Medical Beauty Clinic",
  openGraph: {
    title: site.site.title || "YS Clinic",
    description: site.site.description || "Premium Medical Beauty Clinic",
    type: "website",
    url: site.site.link || "https://example.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
