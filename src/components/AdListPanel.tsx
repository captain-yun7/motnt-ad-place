import { AdResponse } from '@/types/ad';
import AdCard from './AdCard';
import { useEffect, useRef, useState, useMemo } from 'react';

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
  const adRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [sortType, setSortType] = useState<'recommended' | 'price'>('recommended');
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc'>('asc');

  // selectedAdId가 변경될 때 해당 광고로 스크롤
  useEffect(() => {
    if (selectedAdId && adRefs.current[selectedAdId]) {
      adRefs.current[selectedAdId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedAdId]);

  // 추천순 점수 계산
  const calculateRecommendedScore = (ad: AdResponse): number => {
    let score = 0;

    // 추천 광고 최우선
    if (ad.featured) score += 1000;

    // 광고 가능 여부
    if (ad.isActive) score += 500;

    // 검증된 광고
    if (ad.verified) score += 100;

    // 조회수
    score += (ad.viewCount || 0) * 0.3;

    // 일 평균 노출
    score += (ad.metadata?.performanceMetrics?.averageViews || 0) * 0.25;

    // 관심 등록
    score += (ad.favoriteCount || 0) * 0.2;

    // 문의 수
    score += (ad.inquiryCount || 0) * 0.15;

    return score;
  };

  // 정렬된 광고 목록
  const sortedAds = useMemo(() => {
    if (sortType === 'recommended') {
      return [...ads].sort((a, b) => {
        return calculateRecommendedScore(b) - calculateRecommendedScore(a);
      });
    } else {
      // 가격순
      return [...ads].sort((a, b) => {
        const priceA = a.pricing?.monthly || 999999999; // 가격 없으면 맨 뒤로
        const priceB = b.pricing?.monthly || 999999999;

        if (priceOrder === 'asc') {
          return priceA - priceB;
        } else {
          return priceB - priceA;
        }
      });
    }
  }, [ads, sortType, priceOrder]);

  // 가격순 버튼 클릭 핸들러
  const handlePriceSort = () => {
    if (sortType === 'price') {
      // 이미 가격순이면 오름차순/내림차순 토글
      setPriceOrder(priceOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 가격순으로 변경
      setSortType('price');
      setPriceOrder('asc'); // 기본 오름차순
    }
  };

  return (
    <>
      {/* Panel - 항상 표시 */}
      <div
        className="fixed left-0 bg-white border-r border-gray-200 z-30 flex flex-col"
        style={{
          width: '416px',
          top: '0',
          height: '100vh',
          paddingTop: showSubFilters ? '180px' : '80px' // 서브필터 열림/닫힘에 따라 동적 조절
        }}
      >
        {/* Results Summary */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">검색 결과</h3>
            <span className="text-sm text-gray-500">총 {ads.length}개</span>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSortType('recommended')}
              className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${
                sortType === 'recommended'
                  ? 'text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={sortType === 'recommended' ? { backgroundColor: '#C85450' } : {}}
            >
              추천순
            </button>
            <button
              onClick={handlePriceSort}
              className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors flex items-center gap-1 ${
                sortType === 'price'
                  ? 'text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={sortType === 'price' ? { backgroundColor: '#C85450' } : {}}
            >
              가격순
              {sortType === 'price' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {priceOrder === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
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
              sortedAds.map((ad) => (
                <div
                  key={ad.id}
                  ref={(el) => {
                    adRefs.current[ad.id] = el;
                  }}
                >
                  <AdCard
                    ad={ad}
                    onClick={onAdClick}
                    isSelected={selectedAdId === ad.id}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}