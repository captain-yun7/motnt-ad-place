import { useState, useCallback, useMemo } from 'react';
import { AdResponse } from '@/types/ad';

export interface MapBounds {
  sw: { lat: number; lng: number };  // 남서쪽 좌표
  ne: { lat: number; lng: number };  // 북동쪽 좌표
}

export function useMapBounds(ads: AdResponse[]) {
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const updateBounds = useCallback((newBounds: MapBounds) => {
    setBounds(newBounds);
  }, []);

  const visibleAds = useMemo(() => {
    if (!bounds) return ads;

    return ads.filter(ad => {
      if (!ad.location?.coordinates) return false;
      
      const [lng, lat] = ad.location.coordinates;
      
      // 광고가 현재 지도 경계 내에 있는지 확인
      return (
        lat >= bounds.sw.lat &&
        lat <= bounds.ne.lat &&
        lng >= bounds.sw.lng &&
        lng <= bounds.ne.lng
      );
    });
  }, [ads, bounds]);

  return {
    bounds,
    visibleAds,
    updateBounds
  };
}