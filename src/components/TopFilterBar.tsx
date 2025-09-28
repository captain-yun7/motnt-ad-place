import { useState } from 'react';
import { SearchFilters } from '@/hooks/useAdFilter';
import SearchInput from './ui/SearchInput';
import FilterChip from './ui/FilterChip';

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
}

export default function TopFilterBar({
  filters,
  categories,
  districts,
  onFilterChange,
  onSearch,
  onReset
}: TopFilterBarProps) {
  const [showSubFilters, setShowSubFilters] = useState(false);
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange('category', categoryId);
    setShowSubFilters(!!categoryId);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 py-2">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          {/* Left: Logo + Category Filter */}
          <div className="flex items-center space-x-12">
            {/* Logo - 맨 좌측에 붙임 */}
            <img 
              src="https://cdn.imweb.me/thumbnail/20221130/52d8b98b7be24.png" 
              alt="지하철광고 국가대표광고" 
              className="h-6"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
            
            {/* 광고유형 필터만 */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">광고유형:</span>
              <div className="flex space-x-2">
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
          <div className="flex items-center space-x-3">
            <div className="w-64">
              <SearchInput
                value={filters.search}
                onChange={(value) => onFilterChange('search', value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="지역, 건물명, 역 이름을 검색하세요"
              />
            </div>
            <button 
              onClick={onSearch}
              className="bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              검색
            </button>
            <button 
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900 py-2 px-3 transition-colors font-medium text-sm"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Sub Filters Row - 광고유형이 선택된 경우에만 표시 */}
        {showSubFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-6">
              {/* 지역 필터 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">지역:</span>
                <div className="flex space-x-1">
                  <FilterChip
                    isActive={!filters.district}
                    onClick={() => onFilterChange('district', '')}
                    size="sm"
                  >
                    전체
                  </FilterChip>
                  {districts.slice(0, 4).map((district) => (
                    <FilterChip
                      key={district.id}
                      isActive={filters.district === district.id}
                      onClick={() => onFilterChange('district', district.id)}
                      size="sm"
                    >
                      {district.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-4 w-px bg-gray-300"></div>

              {/* 가격 필터 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">가격:</span>
                <select 
                  value={filters.priceRange}
                  onChange={(e) => onFilterChange('priceRange', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="">전체</option>
                  <option value="0-500000">50만원 이하</option>
                  <option value="500000-1500000">50만원 - 150만원</option>
                  <option value="1500000-3000000">150만원 - 300만원</option>
                  <option value="3000000">300만원 이상</option>
                </select>
              </div>

              {/* 추가 필터들 - 광고유형별로 다르게 구성 가능 */}
              {filters.category && (
                <>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">노출시간:</span>
                    <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                      <option value="">전체</option>
                      <option value="morning">오전 (6-12시)</option>
                      <option value="afternoon">오후 (12-18시)</option>
                      <option value="evening">저녁 (18-24시)</option>
                    </select>
                  </div>
                  
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">크기:</span>
                    <div className="flex space-x-1">
                      <FilterChip size="sm">소형</FilterChip>
                      <FilterChip size="sm">중형</FilterChip>
                      <FilterChip size="sm">대형</FilterChip>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}