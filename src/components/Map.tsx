'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Map as KakaoMap, MapMarker, MapInfoWindow, useKakaoLoader, MarkerClusterer } from 'react-kakao-maps-sdk';
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
  onBoundsChange?: (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => void;
}

export default function Map({
  ads = [],
  center = { lat: 37.566826, lng: 126.9786567 }, // 서울시청
  level = 7,
  style = { width: '100%', height: '500px' },
  onMarkerClick,
  onBoundsChange,
}: MapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY!,
    libraries: ['services', 'clusterer'],
  });

  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdResponse | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(level);
  const [isClusteringEnabled, setIsClusteringEnabled] = useState<boolean>(true);

  // 지도 경계가 변경될 때 호출되는 함수
  const handleBoundsChanged = useCallback((map: kakao.maps.Map) => {
    if (!onBoundsChange) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    onBoundsChange({
      sw: { lat: sw.getLat(), lng: sw.getLng() },
      ne: { lat: ne.getLat(), lng: ne.getLng() }
    });
  }, [onBoundsChange]);

  // 줌 레벨 변경 감지
  const handleZoomChanged = useCallback((map: kakao.maps.Map) => {
    const level = map.getLevel();
    setCurrentLevel(level);
    
    // 줌 레벨 7 이하일 때만 클러스터링 활성화 (줌인 시 개별 마커)
    setIsClusteringEnabled(level > 7);
    
    handleBoundsChanged(map);
  }, [handleBoundsChanged]);

  // 클러스터 클릭 시 줌인
  const handleClusterClick = useCallback((_target: any, cluster: any) => {
    if (!mapInstance) return;
    
    const level = mapInstance.getLevel() - 2;
    mapInstance.setLevel(level > 1 ? level : 1);
    mapInstance.panTo(cluster.getCenter());
  }, [mapInstance]);

  // 마커 위치 배열
  const markerPositions = useMemo(() => {
    return ads
      .filter(ad => ad.location?.coordinates)
      .map(ad => ({
        lat: ad.location!.coordinates![1],
        lng: ad.location!.coordinates![0],
        ad: ad
      }));
  }, [ads]);

  // 초기 bounds 설정
  useEffect(() => {
    if (mapInstance && onBoundsChange) {
      // 지도가 생성되면 초기 bounds를 한 번 전달
      handleBoundsChanged(mapInstance);
    }
  }, [mapInstance, handleBoundsChanged, onBoundsChange]);

  useEffect(() => {
    if (!mapInstance || ads.length === 0) return;

    // 광고 위치들의 경계를 계산해서 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds();
    ads.forEach(ad => {
      if (ad.location?.coordinates) {
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
        onCreate={(map) => {
          setMapInstance(map);
        }}
        onBoundsChanged={(map) => handleBoundsChanged(map)}
        onDragEnd={(map) => handleBoundsChanged(map)}
        onZoomChanged={(map) => handleZoomChanged(map)}
        className="rounded-lg border border-gray-200"
        onClick={() => setSelectedAd(null)}
      >
        {/* 클러스터링이 활성화된 경우 */}
        {isClusteringEnabled && markerPositions.length > 0 ? (
          <MarkerClusterer
            averageCenter={true}
            minLevel={8}
            disableClickZoom={true}
            onClusterclick={handleClusterClick}
            calculator={[10, 30, 50, 100]}
            styles={[
              {
                width: '48px',
                height: '48px',
                background: 'rgba(59, 130, 246, 0.9)',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '48px',
                fontSize: '14px',
                border: '2px solid #2563eb'
              },
              {
                width: '56px',
                height: '56px',
                background: 'rgba(37, 99, 235, 0.9)',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '56px',
                fontSize: '16px',
                border: '2px solid #1e40af'
              },
              {
                width: '64px',
                height: '64px',
                background: 'rgba(79, 70, 229, 0.9)',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '64px',
                fontSize: '18px',
                border: '2px solid #4338ca'
              },
              {
                width: '80px',
                height: '80px',
                background: 'rgba(124, 58, 237, 0.9)',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '80px',
                fontSize: '20px',
                border: '2px solid #5b21b6'
              }
            ]}
          >
            {markerPositions.map(({ lat, lng, ad }) => (
              <MapMarker
                key={ad.id}
                position={{ lat, lng }}
                onClick={() => {
                  setSelectedAd(ad);
                  onMarkerClick?.(ad);
                }}
                zIndex={1}
              />
            ))}
          </MarkerClusterer>
        ) : (
          // 클러스터링이 비활성화된 경우 (줌인 상태)
          markerPositions.map(({ lat, lng, ad }) => (
            <MapMarker
              key={ad.id}
              position={{ lat, lng }}
              onClick={() => {
                setSelectedAd(ad);
                onMarkerClick?.(ad);
              }}
              zIndex={1}
            />
          ))
        )}
        
        {/* 인포윈도우 */}
        {selectedAd && selectedAd.location?.coordinates && (
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
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p><span className="font-medium">카테고리:</span> {selectedAd.category.name}</p>
                <p><span className="font-medium">지역:</span> {selectedAd.district.name}</p>
                <p><span className="font-medium">월 금액:</span> {selectedAd.pricing.monthly.toLocaleString()}원</p>
                <p><span className="font-medium">주소:</span> {selectedAd.location?.address}</p>
              </div>
              
              {/* 설명 영역 - 고정 높이로 균일한 여백 확보 */}
              <div className="min-h-[2rem] mb-3">
                {selectedAd.description ? (
                  <p className="text-xs text-gray-500">
                    {selectedAd.description.length > 50 
                      ? `${selectedAd.description.substring(0, 50)}...` 
                      : selectedAd.description
                    }
                  </p>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    onMarkerClick?.(selectedAd);
                    setSelectedAd(null);
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

      {/* 광고 개수 및 클러스터링 상태 표시 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 space-y-1">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-blue-600">{ads.length}</span>개 광고
        </p>
        <p className="text-xs text-gray-500">
          {isClusteringEnabled ? '클러스터 모드' : '개별 마커 모드'} (레벨: {currentLevel})
        </p>
      </div>
    </div>
  );
}