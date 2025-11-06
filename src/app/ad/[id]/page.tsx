'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdResponse } from '@/types/ad';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';

const Map = lazy(() => import('@/components/Map'));

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`/api/ads/${params.id}`);
        if (!response.ok) {
          throw new Error('광고 정보를 불러올 수 없습니다');
        }
        const result = await response.json();
        setAd(result.data);

        // 동적으로 페이지 제목과 메타데이터 업데이트
        if (result.data) {
          document.title = `${result.data.title} | Motnt Ad Place`;

          // 메타 태그 업데이트
          const updateMetaTag = (property: string, content: string) => {
            let meta = document.querySelector(`meta[property="${property}"]`) ||
                      document.querySelector(`meta[name="${property}"]`);
            if (!meta) {
              meta = document.createElement('meta');
              if (property.startsWith('og:')) {
                meta.setAttribute('property', property);
              } else {
                meta.setAttribute('name', property);
              }
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
          };

          const description = result.data.description || `${result.data.district.name} 지역의 ${result.data.category.name} 광고매체 정보`;

          updateMetaTag('description', description);
          updateMetaTag('og:title', result.data.title);
          updateMetaTag('og:description', description);
          updateMetaTag('og:url', window.location.href);
          updateMetaTag('twitter:title', result.data.title);
          updateMetaTag('twitter:description', description);

          if (result.data.images && result.data.images.length > 0) {
            updateMetaTag('og:image', result.data.images[0].url);
            updateMetaTag('twitter:image', result.data.images[0].url);
          }
        }
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <button className="flex items-center space-x-2 font-semibold transition-colors" style={{ color: '#B8312F' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>목록으로 돌아가기</span>
              </button>
              <img
                src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png"
                alt="지하철광고 국가대표광고"
                className="h-7"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="w-32"></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonLoader type="detail" />
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="mt-4 h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 font-semibold transition-colors"
              style={{ color: '#B8312F' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#a84440'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B8312F'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>목록으로 돌아가기</span>
              </button>
              <img
                src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png"
                alt="지하철광고 국가대표광고"
                className="h-7"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="w-32"></div>
            </div>
          </div>
        </header>
        <ErrorMessage
          title="광고 정보를 불러올 수 없습니다"
          message={error || '요청하신 광고를 찾을 수 없습니다.'}
          onRetry={() => window.location.reload()}
          onGoBack={() => router.push('/')}
          className="min-h-[calc(100vh-5rem)]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 font-semibold transition-all hover:gap-3"
              style={{ color: '#B8312F' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#a84440'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B8312F'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>목록으로 돌아가기</span>
            </button>
            <img
              src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png"
              alt="지하철광고 국가대표광고"
              className="h-7"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 광고 정보 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{ad.title}</h1>
                    <p className="text-lg text-gray-600">{ad.location?.address}</p>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                    ad.isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                  }`}>
                    {ad.isActive ? '✓ 광고 가능' : '✗ 광고 불가'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-xl border" style={{ background: 'linear-gradient(to bottom right, #fef2f2, #fde4e3)', borderColor: '#fbb8b5' }}>
                    <span className="text-sm font-semibold block mb-1" style={{ color: '#a84440' }}>카테고리</span>
                    <p className="text-xl font-bold text-gray-900">{ad.category.name}</p>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ background: 'linear-gradient(to bottom right, #fef2f2, #fde4e3)', borderColor: '#fbb8b5' }}>
                    <span className="text-sm font-semibold block mb-1" style={{ color: '#a84440' }}>지역</span>
                    <p className="text-xl font-bold text-gray-900">{ad.district.name}</p>
                  </div>
                </div>

                {ad.description && (
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" style={{ color: '#B8312F' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      상세 설명
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 이미지 갤러리 */}
            {ad.images && ad.images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" style={{ color: '#B8312F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    이미지 갤러리
                  </h2>

                  {/* 메인 이미지 */}
                  <div className="mb-4 rounded-2xl overflow-hidden bg-gray-900 shadow-xl relative group" style={{ height: '500px' }}>
                    <Image
                      src={ad.images[selectedImageIndex].url}
                      alt={ad.images[selectedImageIndex].alt || `광고 이미지 ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      priority
                    />
                    {/* 이미지 카운터 */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                      {selectedImageIndex + 1} / {ad.images.length}
                    </div>
                    {/* 이전/다음 버튼 */}
                    {ad.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* 썸네일 */}
                  {ad.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {ad.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-3 transition-all hover:scale-105 ${
                            selectedImageIndex === index
                              ? 'ring-2 ring-offset-2'
                              : 'border-transparent hover:border-gray-400'
                          }`}
                          style={selectedImageIndex === index ? { borderColor: '#B8312F', ringColor: '#B8312F' } : {}}
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={image.url}
                              alt={image.alt || `썸네일 ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 상세 스펙 */}
            {ad.specs && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" style={{ color: '#B8312F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    광고 사양
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {ad.specs.width && ad.specs.height && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600 block mb-1">크기</span>
                        <p className="text-lg font-bold text-gray-900">{ad.specs.width} × {ad.specs.height}</p>
                      </div>
                    )}
                    {ad.specs.resolution && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600 block mb-1">해상도</span>
                        <p className="text-lg font-bold text-gray-900">{ad.specs.resolution}</p>
                      </div>
                    )}
                    {ad.specs.brightness && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600 block mb-1">밝기</span>
                        <p className="text-lg font-bold text-gray-900">{ad.specs.brightness}</p>
                      </div>
                    )}
                    {ad.specs.material && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600 block mb-1">재질</span>
                        <p className="text-lg font-bold text-gray-900">{ad.specs.material}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 교통 정보 */}
            {(ad.location?.nearestStation || ad.location?.parking) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" style={{ color: '#B8312F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    교통 정보
                  </h2>
                  <div className="space-y-4">
                    {ad.location.nearestStation && (
                      <div className="p-5 rounded-xl border" style={{ background: 'linear-gradient(to right, #fef2f2, #fde4e3)', borderColor: '#fbb8b5' }}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: '#B8312F' }}>
                            <span className="text-white text-xl">🚇</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {ad.location.nearestStation.name} <span style={{ color: '#B8312F' }}>({ad.location.nearestStation.line})</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {ad.location.nearestStation.exit} · 도보 {ad.location.nearestStation.walkingTime}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {ad.location.parking && ad.location.parking.available && (
                      <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white text-xl">🅿️</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 mb-1">주차 가능</div>
                            <div className="text-sm text-gray-600">
                              {ad.location.parking.capacity} · {ad.location.parking.fee}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 통계 정보 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" style={{ color: '#B8312F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  노출 및 참여 통계
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-5 rounded-xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, #B8312F, #a84440)' }}>
                    <div className="text-3xl font-bold text-white mb-1">
                      {(() => {
                        const averageViews = Number(ad.metadata?.performanceMetrics?.averageViews);
                        const viewCount = Number(ad.viewCount) || 0;
                        const value = averageViews || viewCount * 10;
                        return Number.isFinite(value) ? value.toLocaleString() : '0';
                      })()}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: '#ffd7d5' }}>일 평균 노출</div>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-white mb-1">
                      {(ad.viewCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-300 font-semibold">페이지 조회</div>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-white mb-1">
                      {(ad.favoriteCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-300 font-semibold">관심 등록</div>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg">
                    <div className="text-3xl font-bold text-white mb-1">
                      {(ad.inquiryCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-300 font-semibold">문의</div>
                  </div>
                </div>

                {/* 피크 시간대 */}
                {ad.metadata?.performanceMetrics?.peakHours && ad.metadata.performanceMetrics.peakHours.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl border" style={{ background: 'linear-gradient(to right, #fef2f2, #fde4e3)', borderColor: '#fbb8b5' }}>
                    <div className="text-sm font-bold mb-3" style={{ color: '#a84440' }}>피크 시간대</div>
                    <div className="flex flex-wrap gap-2">
                      {ad.metadata.performanceMetrics.peakHours.map((time, index) => (
                        <span key={index} className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: '#B8312F' }}>
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측: Sticky 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* 가격 정보 - 메인 강조 */}
              <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #B8312F, #a84440)' }}>
                <div className="p-8 text-white">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    가격 정보
                  </h2>

                  {/* 주요 가격 */}
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2" style={{ color: '#ffd7d5' }}>월 광고료</div>
                    <div className="text-5xl font-black mb-1">{ad.pricing.monthly.toLocaleString()}<span className="text-2xl">원</span></div>
                    <div className="text-sm" style={{ color: '#ffd7d5' }}>VAT 별도</div>
                  </div>

                  {/* 추가 가격 */}
                  <div className="space-y-3 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                    {ad.pricing.weekly && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#ffd7d5' }}>주 광고료</span>
                        <span className="text-xl font-bold">{ad.pricing.weekly.toLocaleString()}원</span>
                      </div>
                    )}
                    {ad.pricing.daily && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#ffd7d5' }}>일 광고료</span>
                        <span className="text-xl font-bold">{ad.pricing.daily.toLocaleString()}원</span>
                      </div>
                    )}
                    {ad.pricing.deposit && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#ffd7d5' }}>광고비</span>
                        <span className="text-xl font-bold">{ad.pricing.deposit.toLocaleString()}원</span>
                      </div>
                    )}
                    {ad.pricing.minimumPeriod && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: '#ffd7d5' }}>최소 계약</span>
                        <span className="text-xl font-bold">{ad.pricing.minimumPeriod}개월</span>
                      </div>
                    )}
                  </div>

                  {/* 할인 정보 */}
                  {ad.pricing.discounts && Object.keys(ad.pricing.discounts).length > 0 && (
                    <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-sm font-bold text-white mb-3">장기 계약 할인</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(ad.pricing.discounts).map(([period, discount]) => (
                          <span key={period} className="px-3 py-1.5 bg-white text-xs font-bold rounded-full" style={{ color: '#B8312F' }}>
                            {period.replace('months', '개월')}: {discount}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 추가 비용 */}
                  {ad.pricing.additionalCosts && (
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                      <div className="text-sm font-bold mb-3" style={{ color: '#ffd7d5' }}>추가 비용</div>
                      <div className="space-y-2">
                        {ad.pricing.additionalCosts.installation && (
                          <div className="flex justify-between items-center text-sm">
                            <span style={{ color: '#ffd7d5' }}>설치비</span>
                            <span className="font-bold">{ad.pricing.additionalCosts.installation.toLocaleString()}원</span>
                          </div>
                        )}
                        {ad.pricing.additionalCosts.design && (
                          <div className="flex justify-between items-center text-sm">
                            <span style={{ color: '#ffd7d5' }}>디자인비</span>
                            <span className="font-bold">{ad.pricing.additionalCosts.design.toLocaleString()}원</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA 버튼 */}
                <div className="p-6 bg-white">
                  <button className="w-full text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] mb-3" style={{ background: 'linear-gradient(to right, #B8312F, #a84440)' }}>
                    광고 문의하기
                  </button>
                  <button className="w-full border-2 py-3 px-6 rounded-xl font-semibold transition-all" style={{ borderColor: '#B8312F', color: '#B8312F' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    관심 광고 저장
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    전문 상담원이 24시간 내에 연락드립니다
                  </p>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" style={{ color: '#B8312F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    위치 정보
                  </h2>
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 block mb-1">주소</span>
                      <p className="text-sm text-gray-900 font-medium">{ad.location?.address}</p>
                    </div>
                    {ad.location?.landmarks && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs font-semibold text-gray-500 block mb-1">랜드마크</span>
                        <p className="text-sm text-gray-900 font-medium">{ad.location?.landmarks}</p>
                      </div>
                    )}
                  </div>

                  {/* 지도 */}
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <Suspense fallback={
                      <div className="flex items-center justify-center bg-gray-100" style={{ height: '300px' }}>
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-t-transparent mx-auto mb-2" style={{ borderColor: '#B8312F', borderTopColor: 'transparent' }}></div>
                          <p className="text-sm text-gray-600 font-medium">지도 로딩중...</p>
                        </div>
                      </div>
                    }>
                      <Map
                        ads={[ad]}
                        center={ad.location?.coordinates ? {
                          lat: ad.location?.coordinates[1],
                          lng: ad.location?.coordinates[0]
                        } : undefined}
                        level={4}
                        style={{ width: '100%', height: '300px' }}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
