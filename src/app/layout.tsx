import type { Metadata } from "next";
import {
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Serif_JP,
  Noto_Serif_KR,
} from "next/font/google";

import { getSiteContent } from "@/lib/content";

import "./globals.css";

const headingJp = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-heading-ja",
  weight: ["500", "600", "700"],
});

const headingKo = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-heading-ko",
  weight: ["500", "600", "700"],
});

const bodyJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body-ja",
  weight: ["400", "500", "700"],
});

const bodyKo = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body-ko",
  weight: ["400", "500", "700"],
});

const site = getSiteContent();

export const metadata: Metadata = {
  metadataBase: new URL(site.site.link || "https://example.com"),
  title: site.site.title || "YS Clinic",
  description:
    site.site.description || "プレミアム美容クリニックサイト。施術案内と相談予約をご提供します。",
  openGraph: {
    title: site.site.title || "YS Clinic",
    description:
      site.site.description || "プレミアム美容クリニックサイト。施術案内と相談予約をご提供します。",
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
      <body
        className={`${headingJp.variable} ${headingKo.variable} ${bodyJp.variable} ${bodyKo.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
