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
        className={`fixed bg-white border-r border-gray-200 z-35 transition-all duration-300 ease-in-out ${
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
        <div className="p-6 border-b border-gray-200">
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
            <div className="bg-gray-200 rounded-lg h-56 flex items-center justify-center mb-4">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-medium text-gray-700">월 광고료</span>
                <span className="text-xl font-bold text-blue-600">
                  {ad.pricing.monthly.toLocaleString()}원
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {ad.pricing.weekly.toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-600 mt-1">주 광고료</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {ad.pricing.daily.toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-600 mt-1">일 광고료</div>
                </div>
              </div>
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

          {/* Statistics */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">예상 노출 통계</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(Math.random() * 200000 + 50000).toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 mt-1">일 노출수</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(Math.random() * 100000 + 20000).toLocaleString()}
                </div>
                <div className="text-sm text-green-600 mt-1">월 노출수</div>
              </div>
            </div>
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