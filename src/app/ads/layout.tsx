import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '광고 목록',
  description: '전국의 옥외광고 매체를 한눈에 확인하세요. 지역별, 카테고리별로 검색하고 비교할 수 있습니다.',
  openGraph: {
    title: '광고 목록 - Motnt Ad Place',
    description: '전국의 옥외광고 매체를 한눈에 확인하세요. 지역별, 카테고리별로 검색하고 비교할 수 있습니다.',
  },
  twitter: {
    title: '광고 목록 - Motnt Ad Place',
    description: '전국의 옥외광고 매체를 한눈에 확인하세요. 지역별, 카테고리별로 검색하고 비교할 수 있습니다.',
  },
};

export default function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}