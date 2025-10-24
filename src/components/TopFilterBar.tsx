import { useState } from 'react';
import { SearchFilters } from '@/hooks/useAdFilter';
import SearchInput from './ui/SearchInput';
import FilterChip from './ui/FilterChip';
import RegionSelector from './ui/RegionSelector';
import PriceRangeSlider from './ui/PriceRangeSlider';

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

interface TopFilterBarProps {
  filters: SearchFilters;
  categories: Category[];
  districts: District[];
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  showSubFilters: boolean;
  onToggleSubFilters: () => void;
}

export default function TopFilterBar({
  filters,
  categories,
  districts,
  onFilterChange,
  onSearch,
  onReset,
  showSubFilters,
  onToggleSubFilters
}: TopFilterBarProps) {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange('category', categoryId);
  };

  return (
    <div className="bg-white border-b border-gray-200/60 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="px-8 py-5">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          {/* Left: Logo + Category Filter */}
          <div className="flex items-center space-x-16">
            {/* Logo */}
            <img
              src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png"
              alt="지하철광고 국가대표광고"
              className="h-7"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />

            {/* 광고유형 필터 */}
            <div className="flex items-center space-x-4">
              <span className="text-[16px] font-bold text-gray-900 tracking-tight">광고유형</span>
              <div className="flex space-x-2.5">
                <FilterChip
                  isActive={!filters.category}
                  onClick={() => handleCategoryChange('')}
                  size="sm"
                >
                  전체
                </FilterChip>
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    isActive={filters.category === category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    size="sm"
                  >
                    {category.name}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Search */}
          <div className="flex items-center space-x-3.5">
            <div className="w-72">
              <SearchInput
                value={filters.search}
                onChange={(value) => onFilterChange('search', value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="지역, 건물명, 역 이름을 검색하세요"
              />
            </div>
            <button
              onClick={onSearch}
              className="bg-gray-900 text-white py-2.5 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 font-bold text-[15px] shadow-sm hover:shadow-md"
            >
              검색
            </button>
            <button
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900 py-2.5 px-4 transition-colors font-semibold text-[14px]"
            >
              초기화
            </button>
            {/* 필터 토글 버튼 */}
            <button
              onClick={onToggleSubFilters}
              className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-900 bg-white py-2.5 px-4 rounded-lg transition-all duration-200 font-semibold text-[14px] text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md"
              title={showSubFilters ? "검색 조건 접기" : "검색 조건 펼치기"}
            >
              <span>{showSubFilters ? '검색 조건 접기' : '검색 조건 펼치기'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showSubFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sub Filters Row - 지역과 가격 필터 (토글 가능) */}
        {showSubFilters && (
          <div className="mt-5 pt-5 border-t border-gray-200/70">
          <div className="flex items-center gap-8">
            {/* 지역 필터 */}
            <div className="flex items-center space-x-3.5">
              <span className="text-[16px] font-bold text-gray-900 whitespace-nowrap tracking-tight">지역</span>
              <RegionSelector
                districts={districts}
                selectedDistrictId={filters.district}
                onChange={(districtId) => onFilterChange('district', districtId)}
              />
            </div>

            {/* 구분선 */}
            <div className="h-5 w-px bg-gray-300/60"></div>

            {/* 가격 필터 */}
            <div className="flex items-center space-x-3.5 flex-1">
              <span className="text-[16px] font-bold text-gray-900 whitespace-nowrap tracking-tight">가격</span>
              <PriceRangeSlider
                value={filters.priceRange}
                onChange={(value) => onFilterChange('priceRange', value)}
                min={0}
                max={5000000}
                step={100000}
              />
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}