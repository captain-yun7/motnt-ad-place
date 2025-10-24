import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SkipToContent from "@/components/SkipToContent";
import MonitoringSetup from "@/components/MonitoringSetup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased`}
      >
        <SkipToContent />
        <MonitoringSetup />
        {children}
      </body>
    </html>
  );
}
