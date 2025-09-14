import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SkipToContent from "@/components/SkipToContent";
import MonitoringSetup from "@/components/MonitoringSetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Motnt Ad Place',
    default: 'Motnt Ad Place - 옥외광고 정보 플랫폼'
  },
  description: "전국의 옥외광고 매체 정보를 한눈에! 지역별, 카테고리별 광고 매체를 검색하고 비교해보세요.",
  keywords: ["옥외광고", "광고매체", "전광판", "LED", "간판", "광고", "매체"],
  authors: [{ name: "Motnt Ad Place" }],
  creator: "Motnt Ad Place",
  publisher: "Motnt Ad Place",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Motnt Ad Place - 옥외광고 정보 플랫폼',
    description: '전국의 옥외광고 매체 정보를 한눈에! 지역별, 카테고리별 광고 매체를 검색하고 비교해보세요.',
    url: '/',
    siteName: 'Motnt Ad Place',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motnt Ad Place - 옥외광고 정보 플랫폼',
    description: '전국의 옥외광고 매체 정보를 한눈에! 지역별, 카테고리별 광고 매체를 검색하고 비교해보세요.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipToContent />
        <MonitoringSetup />
        {children}
      </body>
    </html>
  );
}
