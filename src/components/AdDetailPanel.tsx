import { AdResponse } from '@/types/ad';
import { useState } from 'react';

interface AdDetailPanelProps {
  ad: AdResponse | null;
  isVisible: boolean;
  onClose: () => void;
  showSubFilters: boolean;
}

export default function AdDetailPanel({ ad, isVisible, onClose, showSubFilters }: AdDetailPanelProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!ad) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (ad.images && ad.images.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const prevImage = () => {
    if (ad.images && ad.images.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  return (
    <>
      {/* Close Button */}
      {isVisible && (
        <button
          onClick={() => {
            console.log('Detail panel close button clicked');
            onClose();
          }}
          className="fixed top-1/2 -translate-y-1/2 z-40 border border-white shadow-lg rounded-l-lg transition-all"
          style={{
            left: '896px', // 416px(리스트) + 480px(상세) = 896px
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#C85450'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b04946'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C85450'}
          title="상세 패널 닫기"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      )}

      {/* Panel */}
      <div
        className={`fixed bg-white border-r border-gray-200 z-35 transition-all duration-300 ease-in-out flex flex-col ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          left: '416px',
          width: '480px',
          top: '0',
          height: '100vh',
          paddingTop: showSubFilters ? '180px' : '80px' // 서브필터 열림/닫힘에 따라 동적 조절
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">광고 상세정보</h2>
          </div>

          {/* Ad Title */}
          <h3 className="text-xl font-bold mb-2" style={{ color: '#C85450' }}>{ad.title}</h3>
          <p className="text-base font-medium text-gray-700">{ad.location?.address}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="p-6 border-b border-gray-200">
            {ad.images && ad.images.length > 0 ? (
              <>
                <div
                  className="bg-gray-200 rounded-lg h-56 overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openLightbox(0)}
                >
                  <img
                    src={ad.images[0].url}
                    alt={ad.images[0].alt || ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ad.images.slice(1, 5).map((image, idx) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => openLightbox(idx + 1)}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || ad.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {ad.images.length > 5 && (
                    <div
                      className="aspect-square rounded border border-gray-200 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'rgba(200, 84, 80, 0.8)' }}
                      onClick={() => openLightbox(5)}
                    >
                      +{ad.images.length - 5}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-200 rounded-lg h-56 flex items-center justify-center mb-4">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="text-center text-sm text-gray-500">이미지가 없습니다</div>
              </>
            )}
          </div>

          {/* Pricing Information */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-4">가격 정보</h4>
            <div className="space-y-3">
              {/* 주요 가격 - 월 광고비 강조 */}
              <div className="p-5 rounded-lg text-center shadow-md" style={{ backgroundColor: '#C85450' }}>
                <div className="text-sm font-semibold mb-1" style={{ color: '#ffd7d5' }}>월 광고비</div>
                <div className="text-4xl font-bold text-white">
                  {ad.pricing?.monthly?.toLocaleString() || '문의'}원
                </div>
              </div>

              {/* 기타 가격 옵션 */}
              <div className="grid grid-cols-2 gap-3">
                {ad.pricing?.weekly && (
                  <div className="p-4 bg-white rounded-lg text-center border-2" style={{ borderColor: '#C85450' }}>
                    <div className="text-sm font-semibold mb-1" style={{ color: '#C85450' }}>주 광고비</div>
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.weekly.toLocaleString()}원
                    </div>
                  </div>
                )}
                {ad.pricing?.daily && (
                  <div className="p-4 bg-white rounded-lg text-center border-2" style={{ borderColor: '#C85450' }}>
                    <div className="text-sm font-semibold mb-1" style={{ color: '#C85450' }}>일 광고비</div>
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.daily.toLocaleString()}원
                    </div>
                  </div>
                )}
                {ad.pricing?.deposit && (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                    <div className="text-sm font-semibold text-gray-700 mb-1">광고비</div>
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.deposit.toLocaleString()}원
                    </div>
                  </div>
                )}
                {ad.pricing?.minimumPeriod && (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                    <div className="text-sm font-semibold text-gray-700 mb-1">최소 계약</div>
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.minimumPeriod}개월
                    </div>
                  </div>
                )}
              </div>

              {/* 할인 정보 - 단순화 */}
              {ad.pricing?.discounts && Object.keys(ad.pricing.discounts).length > 0 && (
                <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#fef2f2', borderColor: '#C85450' }}>
                  <div className="text-base font-bold text-gray-900 mb-3">장기 계약 할인</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ad.pricing.discounts).map(([period, discount]) => (
                      <span key={period} className="text-sm text-white px-3 py-1.5 rounded-md font-bold" style={{ backgroundColor: '#C85450' }}>
                        {period.replace('months', '개월')}: {discount}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 추가 비용 - 단순화 */}
              {ad.pricing?.additionalCosts && (
                <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                  <div className="text-base font-bold text-gray-900 mb-3">추가 비용</div>
                  <div className="space-y-2">
                    {ad.pricing.additionalCosts.installation && (
                      <div className="flex justify-between text-base">
                        <span className="font-medium text-gray-700">설치비</span>
                        <span className="font-bold text-gray-900">{ad.pricing.additionalCosts.installation.toLocaleString()}원</span>
                      </div>
                    )}
                    {ad.pricing.additionalCosts.design && (
                      <div className="flex justify-between text-base">
                        <span className="font-medium text-gray-700">디자인비</span>
                        <span className="font-bold text-gray-900">{ad.pricing.additionalCosts.design.toLocaleString()}원</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ad Information */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-4">광고 정보</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                <label className="text-sm font-bold mb-2 block" style={{ color: '#C85450' }}>카테고리</label>
                <p className="text-lg font-bold text-gray-900">{ad.category.name}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                <label className="text-sm font-bold mb-2 block" style={{ color: '#C85450' }}>지역</label>
                <p className="text-lg font-bold text-gray-900">{ad.district.name}</p>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                <label className="text-sm font-bold mb-2 block" style={{ color: '#C85450' }}>주소</label>
                <p className="text-base font-bold text-gray-900">{ad.location?.address}</p>
              </div>
              {ad.description && (
                <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                  <label className="text-sm font-bold mb-2 block" style={{ color: '#C85450' }}>설명</label>
                  <p className="text-base font-medium text-gray-900 leading-relaxed">{ad.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transportation Info - 단순화 */}
          {(ad.location?.nearestStation || ad.location?.parking) && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">교통 정보</h4>
              <div className="space-y-3">
                {ad.location.nearestStation && (
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C85450' }}>
                        <span className="text-white text-base">🚇</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-900">
                          {ad.location.nearestStation.name} ({ad.location.nearestStation.line})
                        </div>
                        <div className="text-base font-medium text-gray-700 mt-1">
                          {ad.location.nearestStation.exit} · 도보 {ad.location.nearestStation.walkingTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {ad.location.parking && ad.location.parking.available && (
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#C85450' }}>
                        <span className="text-white text-base">🅿️</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-900">주차 가능</div>
                        <div className="text-base font-medium text-gray-700 mt-1">
                          {ad.location.parking.capacity} · {ad.location.parking.fee}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specifications */}
          {ad.specs && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">광고 사양</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ad.specs as Record<string, any>).map(([key, value]) => {
                  // SVG 아이콘 매핑
                  const getIcon = (key: string) => {
                    const keyLower = key.toLowerCase();

                    if (keyLower.includes('width') || keyLower === 'width') {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10M7 12l-3 3m3-3l-3-3m13 3l-3 3m3-3l-3-3" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('height') || keyLower === 'height') {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0-14l-3 3m3-3l3 3m-3 11l-3-3m3 3l3-3" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('resolution')) {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l3-3 2 2 4-4" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('brightness')) {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="5" />
                          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('material')) {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('type')) {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      );
                    }
                    if (keyLower.includes('update')) {
                      return (
                        <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      );
                    }
                    // 기본 아이콘
                    return (
                      <svg className="w-5 h-5" fill="none" stroke="#C85450" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    );
                  };

                  // 한글 라벨 매핑
                  const getLabel = (key: string) => {
                    const keyLower = key.toLowerCase();
                    if (keyLower === 'width') return '가로';
                    if (keyLower === 'height') return '세로';
                    if (keyLower === 'resolution') return '해상도';
                    if (keyLower === 'brightness') return '밝기';
                    if (keyLower === 'material') return '재질';
                    if (keyLower === 'type') return '타입';
                    if (keyLower.includes('update')) return '업데이트';
                    return key;
                  };

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(key)}
                        <span className="text-sm font-bold tracking-wide" style={{ color: '#C85450' }}>
                          {getLabel(key)}
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-900">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistics - 시인성 최우선 */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-4">노출 및 참여 통계</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-5 rounded-lg shadow-sm" style={{ backgroundColor: '#C85450' }}>
                <div className="text-4xl font-bold text-white">
                  {(ad.metadata?.performanceMetrics?.averageViews || (ad.viewCount || 0) * 10).toLocaleString()}
                </div>
                <div className="text-sm font-semibold mt-2" style={{ color: '#ffd7d5' }}>일 평균 노출</div>
              </div>
              <div className="text-center p-5 bg-white rounded-lg border-2" style={{ borderColor: '#C85450' }}>
                <div className="text-4xl font-bold text-gray-900">
                  {(ad.viewCount || 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold mt-2" style={{ color: '#C85450' }}>페이지 조회</div>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-lg border-2 border-gray-300">
                <div className="text-3xl font-bold text-gray-900">
                  {(ad.favoriteCount || 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-gray-700 mt-2">관심 등록</div>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-lg border-2 border-gray-300">
                <div className="text-3xl font-bold text-gray-900">
                  {(ad.inquiryCount || 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-gray-700 mt-2">문의</div>
              </div>
            </div>

            {/* Peak Hours */}
            {ad.metadata?.performanceMetrics?.peakHours && ad.metadata.performanceMetrics.peakHours.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                <div className="text-base font-bold text-gray-900 mb-3">피크 시간대</div>
                <div className="flex flex-wrap gap-2">
                  {ad.metadata.performanceMetrics.peakHours.map((time, index) => (
                    <span key={index} className="text-sm text-white px-3 py-1.5 rounded-md font-bold" style={{ backgroundColor: '#C85450' }}>
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full text-white py-4 rounded-lg transition-colors text-base font-bold shadow-sm" style={{ backgroundColor: '#C85450' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b04946'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C85450'}>
                광고 문의하기
              </button>
              <button className="w-full border-2 py-4 rounded-lg transition-colors text-base font-bold" style={{ borderColor: '#C85450', color: '#C85450' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                관심 광고 저장
              </button>
              <button
                onClick={() => window.location.href = `/ad/${ad.id}`}
                className="w-full border-2 border-gray-300 text-gray-900 py-4 rounded-lg hover:bg-gray-50 transition-colors text-base font-bold"
              >
                상세 페이지 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && ad.images && ad.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {ad.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={ad.images[lightboxIndex].url}
              alt={ad.images[lightboxIndex].alt || ad.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next Button */}
          {ad.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
            {lightboxIndex + 1} / {ad.images.length}
          </div>
        </div>
      )}
    </>
  );
}