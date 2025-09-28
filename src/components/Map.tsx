'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { AdResponse } from '@/types/ad';
import Script from 'next/script';
import { debounce } from 'lodash';

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

declare global {
  interface Window {
    naver: any;
    navermap_authFailure?: () => void;
  }
}

// Map 컴포넌트를 React.memo로 감싸서 불필요한 리렌더링 방지
const Map = memo(function Map({
  ads = [],
  center = { lat: 37.566826, lng: 126.9786567 }, // 서울시청
  level = 7,
  style = { width: '100%', height: '500px' },
  onMarkerClick,
  onBoundsChange,
}: MapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const isFirstLoadRef = useRef<boolean>(true); // 첫 로드 여부 추적
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedAd, setSelectedAd] = useState<AdResponse | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [isClusteringEnabled, setIsClusteringEnabled] = useState<boolean>(true);
  const [mapLoadError, setMapLoadError] = useState<boolean>(false);

  // 네이버맵 인증 실패 핸들러
  useEffect(() => {
    window.navermap_authFailure = () => {
      console.error('네이버맵 인증 실패');
      setMapLoadError(true);
    };
  }, []);

  // 줌 레벨을 네이버맵 스케일로 변환 (카카오맵 레벨 -> 네이버맵 줌)
  const convertLevelToZoom = (kakaoLevel: number) => {
    // 카카오맵 레벨 1-14를 네이버맵 줌 6-19로 변환
    return Math.floor(20 - kakaoLevel);
  };

  // 지도 bounds 변경 시 호출 - debounce 적용으로 과도한 호출 방지
  const [boundsKey, setBoundsKey] = useState(0); // Virtual Clustering 재계산 트리거
  
  const handleBoundsChangeRaw = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;
    
    const bounds = mapRef.current.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();
    
    onBoundsChange({
      sw: { lat: sw.lat(), lng: sw.lng() },
      ne: { lat: ne.lat(), lng: ne.lng() }
    });
    
    // Virtual Clustering을 위한 재계산 트리거
    setBoundsKey(prev => prev + 1);
  }, [onBoundsChange]);

  // debounce를 useCallback 밖에서 정의
  const handleBoundsChange = useRef(
    debounce(handleBoundsChangeRaw, 300)
  ).current;

  // 줌 변경 감지 - debounce 적용
  const handleZoomChangeRaw = useCallback(() => {
    if (!mapRef.current) return;
    
    const zoom = mapRef.current.getZoom();
    setCurrentZoom(zoom);
    
    // 네이버 부동산 스타일: 줌 레벨 15 이하에서 클러스터링, 16 이상에서 개별 마커
    setIsClusteringEnabled(zoom <= 15);
    
    handleBoundsChange();
  }, [handleBoundsChange]);

  const handleZoomChange = useRef(
    debounce(handleZoomChangeRaw, 200)
  ).current;

  // 마커 클릭 핸들러
  const handleMarkerClickInternal = useCallback((ad: AdResponse) => {
    setSelectedAd(ad);
    onMarkerClick?.(ad);
    
    // 인포윈도우 표시
    if (mapRef.current && ad.location?.coordinates && infoWindowRef.current) {
      const [lng, lat] = ad.location.coordinates;
      
      infoWindowRef.current.setContent(`
        <div style="padding: 16px; min-width: 256px;">
          <h3 style="font-weight: 600; color: #111827; margin-bottom: 8px;">
            ${ad.title}
          </h3>
          <div style="font-size: 14px; color: #4B5563; margin-bottom: 12px;">
            <p style="margin: 4px 0;"><strong>카테고리:</strong> ${ad.category.name}</p>
            <p style="margin: 4px 0;"><strong>지역:</strong> ${ad.district.name}</p>
            <p style="margin: 4px 0;"><strong>월 금액:</strong> ${ad.pricing.monthly.toLocaleString()}원</p>
            <p style="margin: 4px 0;"><strong>주소:</strong> ${ad.location?.address || '주소 정보 없음'}</p>
          </div>
          ${ad.description ? `
            <p style="font-size: 12px; color: #6B7280; margin-bottom: 12px;">
              ${ad.description.length > 50 ? ad.description.substring(0, 50) + '...' : ad.description}
            </p>
          ` : ''}
        </div>
      `);
      
      infoWindowRef.current.open(mapRef.current, new window.naver.maps.LatLng(lat, lng));
    }
  }, [onMarkerClick]);

  // 지도 초기화
  const initializeMap = useCallback(() => {
    if (!window.naver || !window.naver.maps) {
      console.error('네이버맵이 로드되지 않았습니다.');
      setTimeout(initializeMap, 100); // 재시도
      return;
    }

    // 클러스터링 모듈 확인
    console.log('Naver Maps Modules:', {
      maps: !!window.naver.maps,
      MarkerClustering: !!(window as any).MarkerClustering
    });

    try {
      const mapOptions = {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: convertLevelToZoom(level),
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
      };

      const map = new window.naver.maps.Map('naver-map', mapOptions);
      mapRef.current = map;

      // 인포윈도우 생성
      infoWindowRef.current = new window.naver.maps.InfoWindow({
        borderWidth: 0,
        backgroundColor: 'white',
        anchorSize: new window.naver.maps.Size(10, 10),
        pixelOffset: new window.naver.maps.Point(0, -10)
      });

      // 이벤트 리스너
      window.naver.maps.Event.addListener(map, 'zoom_changed', handleZoomChange);
      window.naver.maps.Event.addListener(map, 'dragend', handleBoundsChange);
      window.naver.maps.Event.addListener(map, 'click', () => {
        setSelectedAd(null);
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });

      setIsMapLoaded(true);
      
      // 초기 bounds 전달
      handleBoundsChange();
    } catch (error) {
      console.error('네이버맵 초기화 실패:', error);
      setMapLoadError(true);
    }
  }, [center, level, handleZoomChange, handleBoundsChange]);

  // Virtual Clustering - 뷰포트 내 광고만 필터링
  const getVisibleAds = useCallback((allAds: AdResponse[]) => {
    // Virtual Clustering 비활성화 - 모든 광고 표시
    return allAds;
  }, []);

  // 마커 업데이트를 위한 별도 함수 - useCallback 제거하여 의존성 문제 해결
  const updateMarkers = () => {
    if (!isMapLoaded || !mapRef.current || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 기존 클러스터러 제거
    if (clustererRef.current) {
      clustererRef.current.setMap(null);
      clustererRef.current = null;
    }

    // Virtual Clustering - 뷰포트 내 광고만 처리
    const visibleAds = getVisibleAds(ads);
    
    // 성능 로그 (개발 시 참고용)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Virtual Clustering: ${visibleAds.length}/${ads.length} ads visible`);
    }

    // 마커 생성 - 뷰포트 내 광고만 처리
    const markers = visibleAds
      .filter(ad => ad.location?.coordinates)
      .map(ad => {
        const [lng, lat] = ad.location!.coordinates!;
        
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: null, // 클러스터링에서 관리하므로 직접 맵에 추가하지 않음
          icon: {
            content: `
              <div style="
                width: 32px;
                height: 32px;
                background: #3B82F6;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
            `,
            anchor: new window.naver.maps.Point(16, 32),
          }
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
          handleMarkerClickInternal(ad);
        });

        return marker;
      });

    markersRef.current = markers;

    // MarkerClustering은 window 객체에 직접 등록됨
    const MarkerClustering = (window as any).MarkerClustering;
    
    // 디버깅 로그
    console.log('Clustering Debug:', {
      isClusteringEnabled,
      currentZoom,
      markersCount: markers.length,
      hasMarkerClustering: !!MarkerClustering
    });

    // 클러스터링 적용 - 네이버 부동산 스타일  
    if (MarkerClustering && markers.length > 0) {
      // 줌 레벨에 따른 그리드 크기 동적 조정
      const getGridSize = () => {
        if (currentZoom <= 8) return 200;  // 광역 단위
        if (currentZoom <= 10) return 150; // 시/구 단위
        if (currentZoom <= 12) return 100; // 동 단위
        if (currentZoom <= 14) return 80;  // 세부 그룹
        return 60; // 미세 그룹
      };

      // 네이버 부동산 스타일 클러스터 마커 HTML
      const htmlMarker1 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:40px;font-size:13px;color:white;text-align:center;font-weight:bold;background:#667eea;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
        size: new window.naver.maps.Size(40, 40),
        anchor: new window.naver.maps.Point(20, 20)
      };

      const htmlMarker2 = {
        content: '<div style="cursor:pointer;width:50px;height:50px;line-height:50px;font-size:15px;color:white;text-align:center;font-weight:bold;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3)"></div>',
        size: new window.naver.maps.Size(50, 50),
        anchor: new window.naver.maps.Point(25, 25)
      };

      const htmlMarker3 = {
        content: '<div style="cursor:pointer;width:60px;height:60px;line-height:60px;font-size:17px;color:white;text-align:center;font-weight:bold;background:#8b5cf6;border-radius:50%;border:2px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.35)"></div>',
        size: new window.naver.maps.Size(60, 60),
        anchor: new window.naver.maps.Point(30, 30)
      };

      const htmlMarker4 = {
        content: '<div style="cursor:pointer;width:70px;height:70px;line-height:70px;font-size:19px;color:white;text-align:center;font-weight:bold;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 2px 14px rgba(0,0,0,0.4)"></div>',
        size: new window.naver.maps.Size(70, 70),
        anchor: new window.naver.maps.Point(35, 35)
      };

      const htmlMarker5 = {
        content: '<div style="cursor:pointer;width:80px;height:80px;line-height:80px;font-size:21px;color:white;text-align:center;font-weight:bold;background:#1f2937;border-radius:50%;border:2px solid #ef4444;box-shadow:0 2px 16px rgba(0,0,0,0.5)"></div>',
        size: new window.naver.maps.Size(80, 80),
        anchor: new window.naver.maps.Point(40, 40)
      };



      try {
        console.log('Creating MarkerClustering with:', {
          gridSize: getGridSize(),
          markersLength: markers.length,
          isClusteringEnabled
        });

        // 클러스터링은 항상 생성하되, 줌 레벨에 따라 표시 여부 결정
        clustererRef.current = new MarkerClustering({
          minClusterSize: 2,
          maxZoom: 15, // 줌 16부터 개별 마커
          map: isClusteringEnabled ? mapRef.current : null, // 줌 레벨에 따라 표시
          markers: markers,
          disableClickZoom: false, // 기본 줌 기능 사용
          gridSize: getGridSize(),
          icons: [htmlMarker1, htmlMarker2, htmlMarker3, htmlMarker4, htmlMarker5],
          indexGenerator: [10, 100, 1000, 10000], // 개수 구간
          stylingFunction: function(clusterMarker: any, count: number) {
            const element = clusterMarker.getElement();
            if (element && element.firstElementChild) {
              // 숫자 포맷팅 (천 단위 구분)
              const formattedCount = count >= 10000 ? `${Math.floor(count/1000)}k+` : 
                                   count >= 1000 ? `${(count/1000).toFixed(1)}k` : 
                                   count.toString();
              element.firstElementChild.innerHTML = formattedCount;
              
              // 호버 효과 추가
              element.firstElementChild.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.zIndex = '10000';
              };
              element.firstElementChild.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.zIndex = '1';
              };
            }
          }
        });
        
        // 클러스터링이 성공적으로 생성되었는지 확인
        console.log('MarkerClustering created:', !!clustererRef.current);
        
        // 줌 레벨 15 이하에서 클러스터가 표시되어야 함
        if (isClusteringEnabled && clustererRef.current) {
          clustererRef.current.setMap(mapRef.current);
        }
      } catch (error) {
        console.error('클러스터링 초기화 실패:', error);
        // 클러스터링 실패 시 일반 마커로 표시
        markers.forEach(marker => {
          marker.setMap(mapRef.current);
        });
      }
    } else if (!isClusteringEnabled && markers.length > 0) {
      // 줌 레벨 16 이상에서는 개별 마커 표시
      console.log('Showing individual markers at zoom:', currentZoom);
      markers.forEach(marker => {
        marker.setMap(mapRef.current);
      });
    }

    // 지도 범위 조정 - 첫 로드 시에만 (사용자가 조작하기 전)
    if (ads.length > 1 && isFirstLoadRef.current) {
      const bounds = new window.naver.maps.LatLngBounds(
        new window.naver.maps.LatLng(0, 0),
        new window.naver.maps.LatLng(0, 0)
      );
      
      ads.forEach(ad => {
        if (ad.location?.coordinates) {
          const [lng, lat] = ad.location.coordinates;
          bounds.extend(new window.naver.maps.LatLng(lat, lng));
        }
      });
      
      mapRef.current.fitBounds(bounds);
      isFirstLoadRef.current = false; // 첫 로드 완료 표시
    }
  };

  // 마커 업데이트 호출
  useEffect(() => {
    updateMarkers();
  }, [ads, isMapLoaded, isClusteringEnabled, boundsKey]); // 필요한 의존성만 포함

  // 광고 데이터 변경 시에만 fitBounds 리셋
  useEffect(() => {
    if (ads.length > 0) {
      isFirstLoadRef.current = true;
    }
  }, [ads.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      // debounce 함수들 취소
      handleBoundsChange.cancel();
      handleZoomChange.cancel();
      
      // 마커들 제거
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      
      // 클러스터러 제거
      if (clustererRef.current) {
        clustererRef.current.setMap(null);
      }
      
      // 인포윈도우 제거
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [handleBoundsChange, handleZoomChange]);

  // 에러 상태
  if (mapLoadError) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
        style={style}
      >
        <div className="text-center text-red-600">
          <p className="text-sm mb-1">지도를 불러올 수 없습니다</p>
          <p className="text-xs text-red-500">네이버맵 API 키를 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
        strategy="afterInteractive"
        onLoad={() => {
          // MarkerClustering.js 동적 로드
          const script = document.createElement('script');
          script.src = '/MarkerClustering.js';
          script.onload = initializeMap;
          script.onerror = () => setMapLoadError(true);
          document.head.appendChild(script);
        }}
        onError={() => setMapLoadError(true)}
      />
      <div className="relative">
        <div id="naver-map" style={style} className="rounded-lg border border-gray-200" />
        
        {/* 지도가 로딩 중일 때 표시 */}
        {!isMapLoaded && !mapLoadError && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
        
        {/* 지도 컨트롤 */}
        {isMapLoaded && (
          <>
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-1">
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setZoom(mapRef.current.getZoom() + 1);
                  }
                }}
                className="block w-8 h-8 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                title="확대"
              >
                +
              </button>
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setZoom(mapRef.current.getZoom() - 1);
                  }
                }}
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
                {isClusteringEnabled ? '클러스터 모드' : '개별 마커 모드'} (줌: {currentZoom})
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-400">
                  뷰포트 내: <span className="font-medium">{markersRef.current.length}</span>개 렌더링
                </p>
              )}
            </div>
            
            {/* 선택된 광고 정보 패널 */}
            {selectedAd && (
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedAd.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedAd(null);
                    if (infoWindowRef.current) {
                      infoWindowRef.current.close();
                    }
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">카테고리:</span> {selectedAd.category.name}</p>
                  <p><span className="font-medium">월 금액:</span> {selectedAd.pricing.monthly.toLocaleString()}원</p>
                </div>
                <button 
                  onClick={() => onMarkerClick?.(selectedAd)}
                  className="mt-3 w-full bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700"
                >
                  상세 보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // React.memo의 비교 함수 - props가 변경되지 않았으면 리렌더링 방지
  return (
    prevProps.ads === nextProps.ads &&
    prevProps.center?.lat === nextProps.center?.lat &&
    prevProps.center?.lng === nextProps.center?.lng &&
    prevProps.level === nextProps.level &&
    prevProps.style?.width === nextProps.style?.width &&
    prevProps.style?.height === nextProps.style?.height &&
    prevProps.onMarkerClick === nextProps.onMarkerClick &&
    prevProps.onBoundsChange === nextProps.onBoundsChange
  );
});

export default Map;