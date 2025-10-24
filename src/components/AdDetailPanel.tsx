import { AdResponse } from '@/types/ad';

interface AdDetailPanelProps {
  ad: AdResponse | null;
  isVisible: boolean;
  onClose: () => void;
  showSubFilters: boolean;
}

export default function AdDetailPanel({ ad, isVisible, onClose, showSubFilters }: AdDetailPanelProps) {
  if (!ad) return null;

  return (
    <>
      {/* Close Button */}
      {isVisible && (
        <button
          onClick={() => {
            console.log('Detail panel close button clicked');
            onClose();
          }}
          className="fixed top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 shadow-lg rounded-l-lg hover:bg-gray-50 transition-all"
          style={{ 
            left: '896px', // 416px(리스트) + 480px(상세) = 896px
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="상세 패널 닫기"
        >
          <svg 
            className="w-4 h-4 text-gray-600"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{ad.title}</h3>
          <p className="text-sm text-gray-600">{ad.location?.address}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="p-6 border-b border-gray-200">
            {ad.images && ad.images.length > 0 ? (
              <>
                <div className="bg-gray-200 rounded-lg h-56 overflow-hidden mb-4">
                  <img
                    src={ad.images[0].url}
                    alt={ad.images[0].alt || ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ad.images.slice(1, 5).map((image) => (
                    <div key={image.id} className="aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt || ad.title}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                      />
                    </div>
                  ))}
                  {ad.images.length > 5 && (
                    <div className="aspect-square bg-gray-800 bg-opacity-50 rounded border border-gray-200 flex items-center justify-center text-white text-sm font-medium">
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
            <h4 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h4>
            <div className="space-y-3">
              {/* 주요 가격 옵션 - 시인성 최우선 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-4 bg-gray-900 rounded-lg text-center">
                  <div className="text-xl font-bold text-white">
                    {ad.pricing?.monthly?.toLocaleString() || '문의'}원
                  </div>
                  <div className="text-xs text-gray-300 mt-1">월</div>
                </div>
                {ad.pricing?.weekly && (
                  <div className="p-4 bg-white rounded-lg text-center border-2 border-gray-900">
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.weekly.toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-600 mt-1">주</div>
                  </div>
                )}
                {ad.pricing?.daily && (
                  <div className="p-4 bg-white rounded-lg text-center border-2 border-gray-900">
                    <div className="text-xl font-bold text-gray-900">
                      {ad.pricing.daily.toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-600 mt-1">일</div>
                  </div>
                )}
              </div>

              {/* 보증금 및 계약 기간 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">보증금</div>
                  <div className="text-lg font-bold text-gray-900">
                    {ad.pricing?.deposit?.toLocaleString() || '문의'}원
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">최소 계약</div>
                  <div className="text-lg font-bold text-gray-900">
                    {ad.pricing?.minimumPeriod || '-'}개월
                  </div>
                </div>
              </div>

              {/* 할인 정보 - 단순화 */}
              {ad.pricing?.discounts && Object.keys(ad.pricing.discounts).length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-2">장기 계약 할인</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ad.pricing.discounts).map(([period, discount]) => (
                      <span key={period} className="text-xs bg-gray-900 text-white px-2 py-1 rounded font-medium">
                        {period.replace('months', '개월')}: {discount}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 추가 비용 - 단순화 */}
              {ad.pricing?.additionalCosts && (
                <div className="p-3 bg-white rounded-lg border border-gray-300">
                  <div className="text-sm font-medium text-gray-700 mb-2">추가 비용</div>
                  <div className="space-y-1">
                    {ad.pricing.additionalCosts.installation && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">설치비</span>
                        <span className="font-semibold text-gray-900">{ad.pricing.additionalCosts.installation.toLocaleString()}원</span>
                      </div>
                    )}
                    {ad.pricing.additionalCosts.design && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">디자인비</span>
                        <span className="font-semibold text-gray-900">{ad.pricing.additionalCosts.design.toLocaleString()}원</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ad Information */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">광고 정보</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">카테고리</label>
                <p className="text-sm text-gray-900 mt-1">{ad.category.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">지역</label>
                <p className="text-sm text-gray-900 mt-1">{ad.district.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">주소</label>
                <p className="text-sm text-gray-900 mt-1">{ad.location?.address}</p>
              </div>
              {ad.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">설명</label>
                  <p className="text-sm text-gray-900 mt-1">{ad.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transportation Info - 단순화 */}
          {(ad.location?.nearestStation || ad.location?.parking) && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">교통 정보</h4>
              <div className="space-y-3">
                {ad.location.nearestStation && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🚇</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {ad.location.nearestStation.name} ({ad.location.nearestStation.line})
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {ad.location.nearestStation.exit} · 도보 {ad.location.nearestStation.walkingTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {ad.location.parking && ad.location.parking.available && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🅿️</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">주차 가능</div>
                        <div className="text-sm text-gray-600 mt-1">
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
              <h4 className="text-lg font-semibold text-gray-900 mb-4">광고 사양</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(ad.specs as Record<string, any>).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700 capitalize">{key}</label>
                    <p className="text-sm text-gray-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics - 시인성 최우선 */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">노출 및 참여 통계</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-3xl font-bold text-white">
                  {(ad.metadata?.performanceMetrics?.averageViews || ad.viewCount * 10).toLocaleString()}
                </div>
                <div className="text-xs text-gray-300 mt-1">일 평균 노출</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-900">
                <div className="text-3xl font-bold text-gray-900">
                  {ad.viewCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">페이지 조회</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {ad.favoriteCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">관심 등록</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {ad.inquiryCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">문의</div>
              </div>
            </div>

            {/* Peak Hours */}
            {ad.metadata?.performanceMetrics?.peakHours && ad.metadata.performanceMetrics.peakHours.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">피크 시간대</div>
                <div className="flex flex-wrap gap-2">
                  {ad.metadata.performanceMetrics.peakHours.map((time, index) => (
                    <span key={index} className="text-xs bg-gray-900 text-white px-2 py-1 rounded font-medium">
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
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                광고 문의하기
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                관심 광고 저장
              </button>
              <button 
                onClick={() => window.open(`/ad/${ad.id}`, '_blank')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                상세 페이지 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}