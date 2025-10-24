import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SkipToContent from "@/components/SkipToContent";
import MonitoringSetup from "@/components/MonitoringSetup";

// Pretendard 폰트 - 한글 최적화, 모던한 디자인
const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/PretendardVariable.woff2",
      weight: "45 920",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "sans-serif",
  ],
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
      <body className={`${pretendard.variable} font-pretendard antialiased`}>
        <SkipToContent />
        <MonitoringSetup />
        {children}
      </body>
    </html>
  );
}
