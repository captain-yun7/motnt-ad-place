'use client';

import { useEffect } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';

interface ClusterMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
  count: number;
  onClick?: () => void;
}

export default function ClusterMarker({ position, count, onClick }: ClusterMarkerProps) {
  // 광고 개수에 따른 스타일 결정
  const getClusterStyle = (count: number) => {
    if (count < 10) {
      return {
        size: 'w-12 h-12 text-sm',
        background: 'bg-blue-500',
        textColor: 'text-white',
        borderColor: 'border-blue-600',
      };
    } else if (count < 30) {
      return {
        size: 'w-14 h-14 text-base',
        background: 'bg-blue-600',
        textColor: 'text-white',
        borderColor: 'border-blue-700',
      };
    } else if (count < 50) {
      return {
        size: 'w-16 h-16 text-lg',
        background: 'bg-indigo-600',
        textColor: 'text-white',
        borderColor: 'border-indigo-700',
      };
    } else {
      return {
        size: 'w-20 h-20 text-xl',
        background: 'bg-purple-600',
        textColor: 'text-white',
        borderColor: 'border-purple-700',
      };
    }
  };

  const style = getClusterStyle(count);

  return (
    <CustomOverlayMap position={position} yAnchor={0.5} xAnchor={0.5}>
      <div
        onClick={onClick}
        className={`
          ${style.size} ${style.background} ${style.textColor}
          rounded-full flex items-center justify-center
          border-2 ${style.borderColor}
          cursor-pointer hover:scale-110 transition-transform duration-200
          shadow-lg hover:shadow-xl
          font-bold
          relative
        `}
      >
        <span className="relative z-10">{count}</span>
        
        {/* 네이버 부동산 스타일 효과 */}
        <div className="absolute inset-0 rounded-full opacity-30 animate-pulse bg-white"></div>
        
        {/* 클러스터 링 효과 */}
        {count >= 50 && (
          <div className="absolute -inset-1 rounded-full border-2 border-purple-400 opacity-50 animate-ping"></div>
        )}
      </div>
    </CustomOverlayMap>
  );
}