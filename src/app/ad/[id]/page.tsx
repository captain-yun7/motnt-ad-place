'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdResponse } from '@/types/ad';
import Map from '@/components/Map';

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`/api/ads/${params.id}`);
        if (!response.ok) {
          throw new Error('광고 정보를 불러올 수 없습니다');
        }
        const result = await response.json();
        setAd(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAd();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">광고 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-2">광고 정보를 불러올 수 없습니다</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>목록으로 돌아가기</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">광고 상세정보</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 광고 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{ad.title}</h1>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">카테고리</span>
                  <p className="text-lg text-gray-900">{ad.category.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">지역</span>
                  <p className="text-lg text-gray-900">{ad.district.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">월 광고료</span>
                  <p className="text-xl font-bold text-blue-600">{ad.pricing.monthly.toLocaleString()}원</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">상태</span>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ad.isActive ? '광고 가능' : '광고 불가'}
                  </span>
                </div>
              </div>

              {ad.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">상세 설명</h3>
                  <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                </div>
              )}
            </div>

            {/* 상세 스펙 */}
            {ad.specs && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">광고 스펙</h2>
                <div className="grid grid-cols-2 gap-4">
                  {ad.specs.width && ad.specs.height && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">크기</span>
                      <p className="text-gray-900">{ad.specs.width} × {ad.specs.height}</p>
                    </div>
                  )}
                  {ad.specs.resolution && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">해상도</span>
                      <p className="text-gray-900">{ad.specs.resolution}</p>
                    </div>
                  )}
                  {ad.specs.brightness && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">밝기</span>
                      <p className="text-gray-900">{ad.specs.brightness}</p>
                    </div>
                  )}
                  {ad.specs.material && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">재질</span>
                      <p className="text-gray-900">{ad.specs.material}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 이미지 갤러리 */}
            {ad.images && ad.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">갤러리</h2>
                <div className="grid grid-cols-2 gap-4">
                  {ad.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg">
                      <img
                        src={image.url}
                        alt={image.alt || `광고 이미지 ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl4bsnYw8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 우측: 지도 및 연락처 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 위치 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">위치 정보</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">주소</span>
                  <p className="text-gray-900">{ad.location.address}</p>
                </div>
                {ad.location.landmark && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">랜드마크</span>
                    <p className="text-gray-900">{ad.location.landmark}</p>
                  </div>
                )}
              </div>
              
              {/* 지도 */}
              <div className="mt-4">
                <Map
                  ads={[ad]}
                  center={ad.location.coordinates ? {
                    lat: ad.location.coordinates[1],
                    lng: ad.location.coordinates[0]
                  } : undefined}
                  level={4}
                  style={{ width: '100%', height: '300px' }}
                />
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">가격 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">월 광고료</span>
                  <span className="text-lg font-bold text-blue-600">
                    {ad.pricing.monthly.toLocaleString()}원
                  </span>
                </div>
                {ad.pricing.setup && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">설치비</span>
                    <span className="text-gray-900">
                      {ad.pricing.setup.toLocaleString()}원
                    </span>
                  </div>
                )}
                {ad.pricing.design && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">디자인비</span>
                    <span className="text-gray-900">
                      {ad.pricing.design.toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 문의하기 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">문의하기</h2>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                광고 문의하기
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                전문 상담원이 24시간 내에 연락드립니다
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}