'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AdResponse } from '@/types/ad';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';

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

function AdListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    district: searchParams.get('district') || '',
    priceRange: searchParams.get('priceRange') || '',
    sortBy: searchParams.get('sortBy') || 'recent',
  });

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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

        setAds(adsData.data || []);
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

  // 필터링 및 정렬 로직
  const filteredAndSortedAds = () => {
    let filtered = [...ads];

    // 검색어 필터링
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm) ||
        (ad.description && ad.description.toLowerCase().includes(searchTerm)) ||
        ad.district.name.toLowerCase().includes(searchTerm) ||
        ad.location.address.toLowerCase().includes(searchTerm)
      );
    }

    // 카테고리 필터링
    if (filters.category) {
      filtered = filtered.filter(ad => ad.category.id === filters.category);
    }

    // 지역 필터링
    if (filters.district) {
      filtered = filtered.filter(ad => ad.district.id === filters.district);
    }

    // 가격 필터링
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(ad => {
        const monthlyPrice = ad.pricing.monthly;
        if (max) {
          return monthlyPrice >= min && monthlyPrice <= max;
        } else {
          return monthlyPrice >= min;
        }
      });
    }

    // 정렬
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricing.monthly - b.pricing.monthly);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricing.monthly - a.pricing.monthly);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAds = filteredAndSortedAds();
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>지도 보기</span>
                </button>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">광고 목록</h1>
              <div></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <SkeletonLoader type="card" count={9} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                  <span>지도 보기</span>
                </button>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">광고 목록</h1>
              <div></div>
            </div>
          </div>
        </header>
        <ErrorMessage
          title="데이터를 불러올 수 없습니다"
          message={error}
          onRetry={() => window.location.reload()}
          onGoBack={() => router.push('/')}
          className="min-h-[calc(100vh-4rem)]"
        />
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
                <span>지도 보기</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">광고 목록</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 및 정렬 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <input
                type="text"
                placeholder="광고명, 지역..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 가격대 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격대</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="0-500000">50만원 이하</option>
                <option value="500000-1500000">50만원 - 150만원</option>
                <option value="1500000-3000000">150만원 - 300만원</option>
                <option value="3000000">300만원 이상</option>
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">최신순</option>
                <option value="price-low">가격 낮은 순</option>
                <option value="price-high">가격 높은 순</option>
                <option value="name">이름순</option>
              </select>
            </div>
          </div>

          {/* 결과 요약 */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>총 {filteredAds.length}개의 광고</span>
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  category: '',
                  district: '',
                  priceRange: '',
                  sortBy: 'recent'
                });
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              필터 초기화
            </button>
          </div>
        </div>

        {/* 광고 목록 */}
        {paginatedAds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">조건에 맞는 광고가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">필터 조건을 변경해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
                onClick={() => router.push(`/ad/${ad.id}`)}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/ad/${ad.id}`);
                  }
                }}
                aria-label={`${ad.title} 광고 상세보기`}
              >
                {/* 이미지 */}
                <div className="aspect-video bg-gray-200 rounded-t-lg relative">
                  {ad.images && ad.images.length > 0 ? (
                    <Image
                      src={ad.images[0].url}
                      alt={ad.images[0].alt || ad.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">이미지 없음</span>
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {ad.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ad.isActive ? '가능' : '불가'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">카테고리:</span> {ad.category.name}</p>
                    <p><span className="font-medium">지역:</span> {ad.district.name}</p>
                    <p><span className="font-medium">주소:</span> {ad.location.address}</p>
                  </div>

                  {ad.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {ad.description.length > 80 
                        ? `${ad.description.substring(0, 80)}...` 
                        : ad.description
                      }
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      {ad.pricing.monthly.toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-500">
                      /월
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              {/* 이전 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                이전
              </button>

              {/* 페이지 번호 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* 다음 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>지도 보기</span>
                </button>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">광고 목록</h1>
              <div></div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <SkeletonLoader type="card" count={9} />
        </main>
      </div>
    }>
      <AdListPageContent />
    </Suspense>
  );
}