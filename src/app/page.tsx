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

    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm) ||
        (ad.description && ad.description.toLowerCase().includes(searchTerm)) ||
        ad.district.name.toLowerCase().includes(searchTerm) ||
        (ad.location && ad.location.address.toLowerCase().includes(searchTerm))
      );
    }

    if (currentFilters.category) {
      filtered = filtered.filter(ad => ad.category.id === currentFilters.category);
    }

    if (currentFilters.district) {
      filtered = filtered.filter(ad => ad.district.id === currentFilters.district);
    }

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
    <div className="flex h-screen bg-white">
      {/* Left Panel - Logo & Ad List */}
      <div className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <img 
            src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png" 
            alt="지하철광고 국가대표광고" 
            className="h-8 mb-6"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
          
          {/* Search Section */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            광고 위치 검색
          </h1>
          
          {/* Main Search */}
          <div className="relative mb-4">
            <input 
              type="text" 
              placeholder="지역, 건물명, 역 이름을 검색하세요"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {districts.slice(0, 4).map((district) => (
              <button 
                key={district.id}
                onClick={() => handleFilterChange('district', district.id)}
                className={`px-3 py-1.5 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors ${
                  filters.district === district.id ? 'bg-gray-900 text-white' : ''
                }`}
              >
                {district.name}
              </button>
            ))}
          </div>
          
          {/* Filter Actions */}
          <div className="flex space-x-3">
            <button 
              onClick={handleSearch}
              className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              검색 적용
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
        
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
        
        {/* Location Cards Scroll Area */}
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
                <div 
                  key={ad.id} 
                  className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleMarkerClick(ad)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{ad.location?.address || '주소 정보 없음'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="font-medium">월 {ad.pricing.monthly.toLocaleString()}원</span>
                        <span>•</span>
                        <span>일 노출 {Math.floor(Math.random() * 200000 + 50000).toLocaleString()}회</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 text-sm">
                            ★★★★★
                          </div>
                          <span className="ml-2 text-sm text-gray-500">4.8 (124)</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {ad.category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
      
      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-gray-50" style={{ minHeight: '100vh' }}>
        <Suspense fallback={
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        }>
          <Map
            ads={ads}
            style={{ width: '100%', height: '100vh' }}
            onMarkerClick={handleMarkerClick}
          />
        </Suspense>
      </div>
    </div>
  );
}