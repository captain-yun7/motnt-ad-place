'use client';

import { useEffect, useState } from 'react';
import { Map as KakaoMap, MapMarker, MapInfoWindow, useKakaoLoader } from 'react-kakao-maps-sdk';
import { AdResponse } from '@/types/ad';

interface MapProps {
  ads?: AdResponse[];
  center?: {
    lat: number;
    lng: number;
  };
  level?: number;
  style?: {
    width: string;
    height: string;
  };
  onMarkerClick?: (ad: AdResponse) => void;
}

export default function Map({
  ads = [],
  center = { lat: 37.566826, lng: 126.9786567 }, // 서울시청
  level = 7,
  style = { width: '100%', height: '500px' },
  onMarkerClick,
}: MapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY!,
    libraries: ['services', 'clusterer'],
  });

  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdResponse | null>(null);

  useEffect(() => {
    if (!mapInstance || ads.length === 0) return;

    // 광고 위치들의 경계를 계산해서 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds();
    ads.forEach(ad => {
      if (ad.location.coordinates) {
        const [lng, lat] = ad.location.coordinates;
        bounds.extend(new kakao.maps.LatLng(lat, lng));
      }
    });

    if (ads.length > 1) {
      mapInstance.setBounds(bounds);
    }
  }, [mapInstance, ads]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={style}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
        style={style}
      >
        <div className="text-center text-red-600">
          <p className="text-sm mb-1">지도를 불러올 수 없습니다</p>
          <p className="text-xs text-red-500">카카오맵 API 키를 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <KakaoMap
        center={center}
        style={style}
        level={level}
        onCreate={setMapInstance}
        className="rounded-lg border border-gray-200"
        onClick={() => setSelectedAd(null)}
      >
        {ads.map(ad => {
          if (!ad.location.coordinates) return null;
          
          const [lng, lat] = ad.location.coordinates;
          
          return (
            <MapMarker
              key={ad.id}
              position={{ lat, lng }}
              title={ad.title}
              onClick={() => {
                setSelectedAd(ad);
                onMarkerClick?.(ad);
              }}
              zIndex={1}
            />
          );
        })}
        
        {/* 인포윈도우 */}
        {selectedAd && selectedAd.location.coordinates && (
          <MapInfoWindow
            position={{
              lat: selectedAd.location.coordinates[1],
              lng: selectedAd.location.coordinates[0]
            }}
            removable={true}
          >
            <div className="p-4 min-w-64">
              <h3 className="font-semibold text-gray-900 mb-2">
                {selectedAd.title}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">카테고리:</span> {selectedAd.category.name}</p>
                <p><span className="font-medium">지역:</span> {selectedAd.district.name}</p>
                <p><span className="font-medium">월 금액:</span> {selectedAd.pricing.monthly.toLocaleString()}원</p>
                <p><span className="font-medium">주소:</span> {selectedAd.location.address}</p>
                {selectedAd.description && (
                  <p className="text-xs mt-2 text-gray-500">
                    {selectedAd.description.length > 50 
                      ? `${selectedAd.description.substring(0, 50)}...` 
                      : selectedAd.description
                    }
                  </p>
                )}
              </div>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => {
                    window.location.href = `/ad/${selectedAd.id}`;
                  }}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700"
                >
                  상세 보기
                </button>
                <button 
                  onClick={() => setSelectedAd(null)}
                  className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  닫기
                </button>
              </div>
            </div>
          </MapInfoWindow>
        )}
      </KakaoMap>
      
      {/* 지도 컨트롤 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-1">
        <button
          onClick={() => mapInstance?.setLevel(mapInstance.getLevel() - 1)}
          className="block w-8 h-8 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="확대"
        >
          +
        </button>
        <button
          onClick={() => mapInstance?.setLevel(mapInstance.getLevel() + 1)}
          className="block w-8 h-8 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="축소"
        >
          -
        </button>
      </div>

      {/* 광고 개수 표시 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-blue-600">{ads.length}</span>개 광고
        </p>
      </div>
    </div>
  );
}