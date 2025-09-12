'use client';

import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import { AdResponse } from '@/types/ad';

export default function Home() {
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads');
        if (!response.ok) {
          throw new Error('광고 데이터를 불러올 수 없습니다');
        }
        const result = await response.json();
        setAds(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleMarkerClick = (ad: AdResponse) => {
    console.log('Selected ad:', ad);
    // TODO: 광고 상세 정보 표시 또는 페이지 이동
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Motnt Ad Place
              </h1>
              <span className="ml-3 text-sm text-gray-500">
                옥외광고 정보 플랫폼
              </span>
            </div>
            <nav className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                광고 찾기
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                문의하기
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 - 검색 & 필터 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                광고 검색
              </h2>
              
              {/* 검색 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역 검색
                </label>
                <input
                  type="text"
                  placeholder="강남구, 홍대 등..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 카테고리 필터 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  광고 유형
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">전체</option>
                  <option value="LED 전광판">LED 전광판</option>
                  <option value="현수막">현수막</option>
                  <option value="버스정류장">버스정류장</option>
                  <option value="지하철역">지하철역</option>
                  <option value="옥외간판">옥외간판</option>
                </select>
              </div>

              {/* 가격 필터 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월 광고료
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">전체</option>
                  <option value="0-500000">50만원 이하</option>
                  <option value="500000-1500000">50만원 - 150만원</option>
                  <option value="1500000-3000000">150만원 - 300만원</option>
                  <option value="3000000-">300만원 이상</option>
                </select>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                검색
              </button>
            </div>

            {/* 광고 개수 및 통계 */}
            {!loading && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  검색 결과
                </h3>
                <p className="text-sm text-gray-600">
                  총 {ads.length}개의 광고를 찾았습니다
                </p>
              </div>
            )}
          </div>

          {/* 지도 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  광고 위치 지도
                </h2>
                <div className="text-sm text-gray-500">
                  마커를 클릭하면 상세 정보를 볼 수 있습니다
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '600px' }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">데이터를 불러오는 중...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200" style={{ height: '600px' }}>
                  <div className="text-center text-red-600">
                    <p className="text-sm mb-1">데이터를 불러올 수 없습니다</p>
                    <p className="text-xs text-red-500">{error}</p>
                  </div>
                </div>
              ) : (
                <Map
                  ads={ads}
                  style={{ width: '100%', height: '600px' }}
                  onMarkerClick={handleMarkerClick}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}