import { AdResponse } from '@/types/ad';
import AdCard from './AdCard';

interface AdListPanelProps {
  ads: AdResponse[];
  loading: boolean;
  error: string | null;
  isVisible: boolean;
  onToggle: () => void;
  onAdClick: (ad: AdResponse) => void;
  selectedAdId?: string | null;
  onCloseDetail?: () => void;
  showSubFilters: boolean;
}

export default function AdListPanel({
  ads,
  loading,
  error,
  isVisible,
  onToggle,
  onAdClick,
  selectedAdId,
  onCloseDetail,
  showSubFilters
}: AdListPanelProps) {
  
  const handleToggle = () => {
    onToggle();
    // 리스트 패널을 닫을 때 상세 패널도 함께 닫기
    if (isVisible && onCloseDetail) {
      onCloseDetail();
    }
  };
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 shadow-lg rounded-r-lg p-2 hover:bg-gray-50 transition-all ${
          isVisible ? 'left-[416px]' : 'left-0'
        }`}
        title={isVisible ? "패널 숨기기" : "패널 보이기"}
      >
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform ${isVisible ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`fixed left-0 bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '416px',
          top: '0',
          height: '100vh',
          paddingTop: showSubFilters ? '180px' : '80px' // 서브필터 열림/닫힘에 따라 동적 조절
        }}
      >
        {/* Results Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">검색 결과</h3>
            <span className="text-sm text-gray-500">총 {ads.length}개</span>
          </div>
          
          {/* Sort Options */}
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-full">
              추천순
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50">
              가격순
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50">
              거리순
            </button>
          </div>
        </div>
        
        {/* Ad List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                <p className="text-sm mb-1">데이터를 불러올 수 없습니다</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">검색 결과가 없습니다</p>
              </div>
            ) : (
              ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onClick={onAdClick}
                  isSelected={selectedAdId === ad.id}
                />
              ))
            )}
            
            {/* Load More */}
            {ads.length > 0 && (
              <div className="p-6 text-center">
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  더 많은 결과 보기 →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}