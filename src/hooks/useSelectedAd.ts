import { useState, useCallback } from 'react';
import { AdResponse } from '@/types/ad';

export function useSelectedAd() {
  const [selectedAd, setSelectedAd] = useState<AdResponse | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const selectAd = useCallback((ad: AdResponse) => {
    setSelectedAd(ad);
    setShowDetail(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAd(null);
    setShowDetail(false);
  }, []);

  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedAd(null);
  }, []);

  return {
    selectedAd,
    showDetail,
    selectAd,
    clearSelection,
    closeDetail
  };
}