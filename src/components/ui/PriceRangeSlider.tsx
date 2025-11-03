'use client';

import { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  value: string; // "min-max" 형식
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function PriceRangeSlider({
  value,
  onChange,
  min = 0,
  max = 20000000, // 2000만원
  step = 100000  // 10만원 단위
}: PriceRangeSliderProps) {
  // value를 파싱하여 minValue, maxValue 추출
  const [minValue, setMinValue] = useState<number>(min);
  const [maxValue, setMaxValue] = useState<number>(max);

  // value prop이 변경될 때 상태 업데이트
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 2) {
        setMinValue(Number(parts[0]));
        setMaxValue(Number(parts[1]) || max);
      } else if (parts.length === 1 && parts[0]) {
        // "3000000" 형식 (이상)
        setMinValue(Number(parts[0]));
        setMaxValue(max);
      }
    } else {
      setMinValue(min);
      setMaxValue(max);
    }
  }, [value, min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= maxValue) {
      setMinValue(newMin);
      updateValue(newMin, maxValue);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= minValue) {
      setMaxValue(newMax);
      updateValue(minValue, newMax);
    }
  };

  const updateValue = (newMin: number, newMax: number) => {
    if (newMin === min && newMax === max) {
      onChange(''); // 전체 범위면 빈 문자열
    } else {
      onChange(`${newMin}-${newMax}`);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(price % 10000000 === 0 ? 0 : 1)}천만`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}백만`;
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}만`;
    } else {
      return `${price.toLocaleString()}`;
    }
  };

  const handleReset = () => {
    setMinValue(min);
    setMaxValue(max);
    onChange('');
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const clickValue = Math.round((min + percentage * (max - min)) / step) * step;

    // 클릭한 위치가 현재 범위의 중간값보다 작으면 minValue를, 크면 maxValue를 조정
    const midValue = (minValue + maxValue) / 2;
    if (clickValue < midValue) {
      // 최소값 조정
      if (clickValue <= maxValue) {
        setMinValue(clickValue);
        updateValue(clickValue, maxValue);
      }
    } else {
      // 최대값 조정
      if (clickValue >= minValue) {
        setMaxValue(clickValue);
        updateValue(minValue, clickValue);
      }
    }
  };

  return (
    <div className="flex items-center gap-5 w-full max-w-2xl">
      {/* 최소가격 표시 */}
      <div className="text-[15px] font-bold whitespace-nowrap min-w-[70px] text-right" style={{ color: '#C85450' }}>
        {formatPrice(minValue)}
      </div>

      {/* 슬라이더 영역 */}
      <div className="flex-1 relative px-1">
        {/* 배경 트랙 */}
        <div
          className="h-2 bg-gray-100 rounded-full relative cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* 선택된 범위 표시 */}
          <div
            className="h-2 rounded-full absolute shadow-sm pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #C85450, #a84440)',
              left: `${((minValue - min) / (max - min)) * 100}%`,
              right: `${100 - ((maxValue - min) / (max - min)) * 100}%`
            }}
          />
        </div>

        {/* 최소값 슬라이더 */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          style={{
            '--thumb-color': '#C85450'
          } as React.CSSProperties}
          className="absolute w-full h-2 -top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-[#C85450] [&::-moz-range-thumb]:border-[#C85450]"
        />

        {/* 최대값 슬라이더 */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          style={{
            '--thumb-color': '#C85450'
          } as React.CSSProperties}
          className="absolute w-full h-2 -top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-[#C85450] [&::-moz-range-thumb]:border-[#C85450]"
        />
      </div>

      {/* 최대가격 표시 */}
      <div className="text-[15px] font-bold whitespace-nowrap min-w-[70px]" style={{ color: '#C85450' }}>
        {formatPrice(maxValue)}
      </div>

      {/* 초기화 버튼 */}
      {(minValue !== min || maxValue !== max) && (
        <button
          onClick={handleReset}
          className="text-[14px] font-semibold whitespace-nowrap transition-colors"
          style={{ color: '#C85450' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#a84440'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#C85450'}
        >
          초기화
        </button>
      )}
    </div>
  );
}
