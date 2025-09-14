'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { AdResponse } from '@/types/ad';

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

interface SearchFilters {
  search: string;
  category: string;
  district: string;
  priceRange: string;
}

export default function Home() {
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [allAds, setAllAds] = useState<AdResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    district: '',
    priceRange: ''
  });

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
        setAds(adsArray);
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

  const handleMarkerClick = (ad: AdResponse) => {
    window.open(`/ad/${ad.id}`, '_blank');
  };

  const filterAds = (currentFilters: SearchFilters) => {
    let filtered = [...allAds];

    // 검색어 필터링 (지역명, 제목, 설명)
    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm) ||
        (ad.description && ad.description.toLowerCase().includes(searchTerm)) ||
        ad.district.name.toLowerCase().includes(searchTerm) ||
        ad.location.address.toLowerCase().includes(searchTerm)
      );
    }

    // 카테고리 필터링
    if (currentFilters.category) {
      filtered = filtered.filter(ad => ad.category.id === currentFilters.category);
    }

    // 지역 필터링
    if (currentFilters.district) {
      filtered = filtered.filter(ad => ad.district.id === currentFilters.district);
    }

    // 가격 필터링
    if (currentFilters.priceRange) {
      const [min, max] = currentFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(ad => {
        const monthlyPrice = ad.pricing.monthly;
        if (max) {
          return monthlyPrice >= min && monthlyPrice <= max;
        } else {
          return monthlyPrice >= min;
        }
      });
    }

    setAds(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    filterAds(newFilters);
  };

  const handleSearch = () => {
    filterAds(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      district: '',
      priceRange: ''
    };
    setFilters(resetFilters);
    setAds(allAds);
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
              <button
                onClick={() => window.location.href = '/ads'}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                광고 찾기
              </button>
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
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 - 검색 & 필터 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                광고 검색
              </h2>
              
              {/* 검색 입력 */}
              <div className="mb-4">
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                  지역 검색
                </label>
                <input
                  id="search-input"
                  type="text"
                  placeholder="강남구, 홍대 등..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">
                  광고 위치나 이름을 입력하여 검색하세요
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div className="mb-4">
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                  광고 유형
                </label>
                <select 
                  id="category-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="광고 유형 선택"
                >
                  <option value="">전체</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.adCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* 지역 필터 */}
              <div className="mb-4">
                <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-2">
                  지역
                </label>
                <select 
                  id="district-select"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="지역 선택"
                >
                  <option value="">전체</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name} ({district.adCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* 가격 필터 */}
              <div className="mb-6">
                <label htmlFor="price-select" className="block text-sm font-medium text-gray-700 mb-2">
                  월 광고료
                </label>
                <select 
                  id="price-select"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="가격대 선택"
                >
                  <option value="">전체</option>
                  <option value="0-500000">50만원 이하</option>
                  <option value="500000-1500000">50만원 - 150만원</option>
                  <option value="1500000-3000000">150만원 - 300만원</option>
                  <option value="3000000">300만원 이상</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={handleSearch}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="광고 검색 실행"
                >
                  검색
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="검색 조건 초기화"
                >
                  초기화
                </button>
              </div>
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
                <div className="text-sm text-gray-500" role="note">
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
                <Suspense fallback={
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '600px' }}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
                    </div>
                  </div>
                }>
                  <Map
                    ads={ads}
                    style={{ width: '100%', height: '600px' }}
                    onMarkerClick={handleMarkerClick}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}