'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { AdResponse } from '@/types/ad';
import { useAdFilter } from '@/hooks/useAdFilter';
import { useToggle } from '@/hooks/useToggle';
import { useSelectedAd } from '@/hooks/useSelectedAd';
import { useMapBounds } from '@/hooks/useMapBounds';
import TopFilterBar from '@/components/TopFilterBar';
import AdListPanel from '@/components/AdListPanel';
import AdDetailPanel from '@/components/AdDetailPanel';

const Map = lazy(() => import('@/components/Map'));

interface Category {
  id: string;
  name: string;
  description: string | null;
  adCount: number;
}

interface District {
  id: string;
  name: string;
  city: string;
  adCount: number;
}

export default function Home() {
  const [allAds, setAllAds] = useState<AdResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom hooks
  const { filters, filteredAds, updateFilter, resetFilters } = useAdFilter(allAds);
  const { value: isPanelVisible, toggle: togglePanel, setTrue: openPanel } = useToggle(true);
  const { selectedAd, showDetail, selectAd, closeDetail } = useSelectedAd();
  const { visibleAds, updateBounds } = useMapBounds(filteredAds);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsRes, categoriesRes, districtsRes] = await Promise.all([
          fetch('/api/ads'),
          fetch('/api/categories'),
          fetch('/api/districts')
        ]);

        if (!adsRes.ok || !categoriesRes.ok || !districtsRes.ok) {
          throw new Error('데이터를 불러올 수 없습니다');
        }

        const [adsData, categoriesData, districtsData] = await Promise.all([
          adsRes.json(),
          categoriesRes.json(),
          districtsRes.json()
        ]);

        const adsArray = adsData.data || [];
        setAllAds(adsArray);
        setCategories(categoriesData.data || []);
        setDistricts(districtsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdClick = (ad: AdResponse) => {
    selectAd(ad);
    // 리스트 패널이 닫혀있으면 자동으로 열기
    if (!isPanelVisible) {
      openPanel();
    }
  };

  const handleSearch = () => {
    // 이미 useAdFilter 훅에서 실시간으로 필터링되므로 별도 로직 불필요
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Filter Bar */}
      <TopFilterBar
        filters={filters}
        categories={categories}
        districts={districts}
        onFilterChange={updateFilter}
        onSearch={handleSearch}
        onReset={resetFilters}
      />

      {/* Main Content Area */}
      <div className="relative">
        {/* Ad List Panel (Toggleable) */}
        <AdListPanel
          ads={visibleAds}
          loading={loading}
          error={error}
          isVisible={isPanelVisible}
          onToggle={togglePanel}
          onAdClick={handleAdClick}
          selectedAdId={selectedAd?.id}
          onCloseDetail={closeDetail}
        />

        {/* Ad Detail Panel */}
        <AdDetailPanel
          ad={selectedAd}
          isVisible={showDetail}
          onClose={closeDetail}
        />

        {/* Map Area */}
        <div 
          className={`h-screen transition-all duration-300 ${
            isPanelVisible 
              ? showDetail 
                ? 'ml-[896px]' // 416px(리스트) + 480px(상세) = 896px
                : 'ml-[416px]' // 리스트만 있을 때
              : 'ml-0' // 모두 숨겨졌을 때
          }`}
          style={{ paddingTop: '0' }} // 여백 제거
        >
          <Suspense fallback={
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
              </div>
            </div>
          }>
            <Map
              ads={filteredAds}
              selectedCategory={filters.category}
              style={{ width: '100%', height: '100vh' }}
              onMarkerClick={handleAdClick}
              onBoundsChange={updateBounds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}