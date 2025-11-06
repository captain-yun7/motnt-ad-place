'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { AdResponse } from '@/types/ad';
import Script from 'next/script';
import { debounce } from 'lodash';

interface MapProps {
  ads?: AdResponse[];
  selectedCategory?: string;
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
  selectedCategory = '',
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
    
    // 줌 레벨 13 이하에서 클러스터링, 14 이상에서 개별 마커
    setIsClusteringEnabled(zoom <= 13);
    
    handleBoundsChange();
  }, [handleBoundsChange]);

  const handleZoomChange = useRef(
    debounce(handleZoomChangeRaw, 200)
  ).current;

  // 마커 클릭 핸들러
  const handleMarkerClickInternal = useCallback((ad: AdResponse) => {
    setSelectedAd(ad);
    onMarkerClick?.(ad);
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
        
        // 카테고리별 마커 디자인 함수
        const getCategoryMarker = (categoryName: string) => {
          let icon = '';
          
          switch(categoryName) {
            case '전광판':
              icon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="4" width="20" height="12" rx="1" stroke="white" stroke-width="2" fill="none"/>
                <circle cx="6" cy="8" r="1" fill="white"/>
                <circle cx="10" cy="8" r="1" fill="white"/>
                <circle cx="14" cy="8" r="1" fill="white"/>
                <circle cx="18" cy="8" r="1" fill="white"/>
                <circle cx="6" cy="12" r="1" fill="white"/>
                <circle cx="10" cy="12" r="1" fill="white"/>
                <circle cx="14" cy="12" r="1" fill="white"/>
                <circle cx="18" cy="12" r="1" fill="white"/>
                <rect x="10" y="16" width="4" height="4" fill="white"/>
              </svg>`;
              break;
            case '현수막':
              icon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M4 5h16v10c0 0-2 2-4 0s-4 2-4 0-4 2-4 0-4 2-4 0V5z" stroke="white" stroke-width="1.5" fill="white" opacity="0.9"/>
                <line x1="4" y1="5" x2="20" y2="5" stroke="white" stroke-width="2"/>
              </svg>`;
              break;
            case '버스정류장':
              icon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <rect x="5" y="6" width="14" height="10" rx="2" stroke="white" stroke-width="1.5" fill="none"/>
                <circle cx="8" cy="18" r="1.5" fill="white"/>
                <circle cx="16" cy="18" r="1.5" fill="white"/>
                <rect x="7" y="8" width="4" height="3" fill="white"/>
                <rect x="13" y="8" width="4" height="3" fill="white"/>
              </svg>`;
              break;
            case '지하철':
              icon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <rect x="4" y="7" width="16" height="10" rx="2" stroke="white" stroke-width="2" fill="none"/>
                <rect x="6" y="9" width="3" height="3" fill="white"/>
                <rect x="11" y="9" width="3" height="3" fill="white"/>
                <rect x="16" y="9" width="2" height="3" fill="white"/>
                <circle cx="7" cy="19" r="1.5" fill="white"/>
                <circle cx="17" cy="19" r="1.5" fill="white"/>
                <line x1="2" y1="21" x2="22" y2="21" stroke="white" stroke-width="1.5"/>
                <line x1="4" y1="5" x2="7" y2="7" stroke="white" stroke-width="1.5"/>
                <line x1="20" y1="5" x2="17" y2="7" stroke="white" stroke-width="1.5"/>
              </svg>`;
              break;
            case '팝업스토어':
              icon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M3 7h18l-1 13H4L3 7z" stroke="white" stroke-width="2" fill="none"/>
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" stroke-width="2" fill="none"/>
                <circle cx="9" cy="13" r="1" fill="white"/>
                <circle cx="15" cy="13" r="1" fill="white"/>
                <path d="M9 16c0 1 1.5 2 3 2s3-1 3-2" stroke="white" stroke-width="1.5" fill="none"/>
              </svg>`;
              break;
            default:
              icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>`;
          }
          
          return {
            content: `
              <div style="
                width: 54px;
                height: 54px;
                background: #B8312F;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
              "
              onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='1000';"
              onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';"
              title="${categoryName}">
                ${icon}
              </div>
            `,
            anchor: new window.naver.maps.Point(27, 54),
          };
        };
        
        // 줌 레벨 13 이하에서는 1개짜리도 숫자로 표시
        // 줌 레벨 14 이상에서: 아이콘 + 가격 표시 (통일)
        let markerIcon;
        if (currentZoom <= 13) {
          // 줌 레벨 13 이하에서는 클러스터 모드용 숫자 표시
          markerIcon = {
            content: `
              <div style="
                cursor: pointer;
                width: 48px;
                height: 48px;
                line-height: 48px;
                font-size: 21px;
                color: white;
                text-align: center;
                font-weight: 300;
                background: rgba(200, 84, 80, 0.9);
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.3);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">1</div>
            `,
            anchor: new window.naver.maps.Point(24, 24),
          };
        } else {
          // 줌 레벨 14 이상: 직사각형 마커 (위: 광고유형, 아래: 월가격)
          const monthlyPrice = ad.pricing.monthly;
          const formattedPrice = monthlyPrice >= 10000000
            ? `${Math.floor(monthlyPrice / 10000000)}천만`
            : monthlyPrice >= 10000
            ? `${Math.floor(monthlyPrice / 10000)}만`
            : `${monthlyPrice.toLocaleString()}`;

          markerIcon = {
            content: `
              <div style="
                cursor: pointer;
                display: flex;
                flex-direction: column;
                min-width: 85px;
                transition: all 0.2s;
                filter: drop-shadow(0 3px 8px rgba(0,0,0,0.4));
              "
              onmouseover="this.style.transform='scale(1.08)'; this.style.zIndex='1000';"
              onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';">
                <!-- 광고 유형 (흰색 배경) -->
                <div style="
                  padding: 6px 12px;
                  background: white;
                  color: #333;
                  font-size: 11px;
                  font-weight: 700;
                  text-align: center;
                  border-top-left-radius: 6px;
                  border-top-right-radius: 6px;
                  border: 1.5px solid #e0e0e0;
                  border-bottom: none;
                  white-space: nowrap;
                  letter-spacing: -0.2px;
                  line-height: 1.2;
                ">
                  ${ad.category.name}
                </div>
                <!-- 월 가격 (색상 배경) -->
                <div style="
                  padding: 7px 12px;
                  background: #B8312F;
                  color: white;
                  font-size: 13px;
                  font-weight: 800;
                  text-align: center;
                  border-bottom-left-radius: 6px;
                  border-bottom-right-radius: 6px;
                  border: 1.5px solid #B8312F;
                  border-top: none;
                  white-space: nowrap;
                  letter-spacing: -0.3px;
                  line-height: 1.2;
                ">
                  ${formattedPrice}
                </div>
              </div>
            `,
            anchor: new window.naver.maps.Point(42, 45),
          };
        }
        
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: null, // 클러스터링에서 관리하므로 직접 맵에 추가하지 않음
          icon: markerIcon
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

      // 줌 레벨에 따른 클러스터 크기 계산
      const getClusterSize = (baseSize: number) => {
        // 줌 레벨 10-13: 레벨 11 크기로 고정 (기본의 0.9배)
        if (currentZoom >= 10 && currentZoom <= 13) {
          return Math.round(baseSize * 0.9);
        }
        // 줌 레벨 9 이하: 기본 크기
        return baseSize;
      };

      // 흰색 배경에 검정색 숫자 클러스터 마커 (줌 레벨에 따라 크기 조정)
      const size1 = getClusterSize(60);
      const size2 = getClusterSize(75);
      const size3 = getClusterSize(90);
      const size4 = getClusterSize(105);
      const size5 = getClusterSize(120);

      const htmlMarker1 = {
        content: `<div style="cursor:pointer;width:${size1}px;height:${size1}px;line-height:${size1}px;font-size:${Math.round(size1 * 0.4)}px;color:white;text-align:center;font-weight:300;background:rgba(200, 84, 80, 0.9);border-radius:50%;border:1px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        size: new window.naver.maps.Size(size1, size1),
        anchor: new window.naver.maps.Point(size1/2, size1/2)
      };

      const htmlMarker2 = {
        content: `<div style="cursor:pointer;width:${size2}px;height:${size2}px;line-height:${size2}px;font-size:${Math.round(size2 * 0.36)}px;color:white;text-align:center;font-weight:300;background:rgba(200, 84, 80, 0.9);border-radius:50%;border:1px solid rgba(255,255,255,0.3);box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
        size: new window.naver.maps.Size(size2, size2),
        anchor: new window.naver.maps.Point(size2/2, size2/2)
      };

      const htmlMarker3 = {
        content: `<div style="cursor:pointer;width:${size3}px;height:${size3}px;line-height:${size3}px;font-size:${Math.round(size3 * 0.33)}px;color:white;text-align:center;font-weight:400;background:rgba(200, 84, 80, 0.9);border-radius:50%;border:1px solid rgba(255,255,255,0.3);box-shadow:0 3px 12px rgba(0,0,0,0.4)"></div>`,
        size: new window.naver.maps.Size(size3, size3),
        anchor: new window.naver.maps.Point(size3/2, size3/2)
      };

      const htmlMarker4 = {
        content: `<div style="cursor:pointer;width:${size4}px;height:${size4}px;line-height:${size4}px;font-size:${Math.round(size4 * 0.31)}px;color:white;text-align:center;font-weight:400;background:rgba(200, 84, 80, 0.9);border-radius:50%;border:1px solid rgba(255,255,255,0.3);box-shadow:0 3px 14px rgba(0,0,0,0.45)"></div>`,
        size: new window.naver.maps.Size(size4, size4),
        anchor: new window.naver.maps.Point(size4/2, size4/2)
      };

      const htmlMarker5 = {
        content: `<div style="cursor:pointer;width:${size5}px;height:${size5}px;line-height:${size5}px;font-size:${Math.round(size5 * 0.3)}px;color:white;text-align:center;font-weight:400;background:rgba(200, 84, 80, 0.9);border-radius:50%;border:1px solid rgba(255,255,255,0.3);box-shadow:0 4px 16px rgba(0,0,0,0.5)"></div>`,
        size: new window.naver.maps.Size(size5, size5),
        anchor: new window.naver.maps.Point(size5/2, size5/2)
      };



      try {
        console.log('Creating MarkerClustering with:', {
          gridSize: getGridSize(),
          markersLength: markers.length,
          isClusteringEnabled
        });

        // 클러스터링은 항상 생성하되, 줌 레벨에 따라 표시 여부 결정
        clustererRef.current = new MarkerClustering({
          minClusterSize: currentZoom <= 13 ? 1 : 2, // 줌 13 이하에서는 1개부터 클러스터링
          maxZoom: 13, // 줌 14부터 개별 마커
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
        
        // 줌 레벨 13 이하에서 클러스터가 표시되어야 함
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
    }
    
    // 줌 레벨 14 이상에서는 개별 마커 표시
    if (!isClusteringEnabled && markers.length > 0) {
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
  }, [ads, isMapLoaded, isClusteringEnabled, boundsKey, selectedCategory]); // selectedCategory 추가

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
          </>
        )}
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // React.memo의 비교 함수 - props가 변경되지 않았으면 리렌더링 방지
  return (
    prevProps.ads === nextProps.ads &&
    prevProps.selectedCategory === nextProps.selectedCategory &&
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