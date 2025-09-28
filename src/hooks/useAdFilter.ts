import { useState, useCallback, useMemo } from 'react';
import { AdResponse } from '@/types/ad';

export interface SearchFilters {
  search: string;
  category: string;
  district: string;
  priceRange: string;
}

export function useAdFilter(allAds: AdResponse[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    district: '',
    priceRange: ''
  });

  const filteredAds = useMemo(() => {
    let filtered = [...allAds];

    // 검색어 필터링
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm) ||
        (ad.description && ad.description.toLowerCase().includes(searchTerm)) ||
        ad.district.name.toLowerCase().includes(searchTerm) ||
        (ad.location && ad.location.address.toLowerCase().includes(searchTerm))
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

    return filtered;
  }, [allAds, filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      district: '',
      priceRange: ''
    });
  }, []);

  return {
    filters,
    filteredAds,
    updateFilter,
    resetFilters,
    setFilters
  };
}