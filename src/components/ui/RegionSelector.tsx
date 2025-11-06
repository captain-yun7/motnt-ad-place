'use client';

import { useState, useMemo } from 'react';

interface District {
  id: string;
  name: string;
  city: string;
  adCount: number;
}

interface RegionSelectorProps {
  districts: District[];
  selectedDistrictId: string;
  onChange: (districtId: string) => void;
}

export default function RegionSelector({
  districts,
  selectedDistrictId,
  onChange
}: RegionSelectorProps) {
  // 시/도 목록 추출
  const cities = useMemo(() => {
    const citySet = new Set(districts.map(d => d.city));
    return Array.from(citySet).sort();
  }, [districts]);

  // 선택된 구의 정보를 찾아서 시/도를 설정
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
  const [selectedCity, setSelectedCity] = useState<string>(selectedDistrict?.city || '');

  // 선택된 시/도에 해당하는 구 목록
  const districtsInCity = useMemo(() => {
    if (!selectedCity) return [];
    return districts
      .filter(d => d.city === selectedCity)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [districts, selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onChange(''); // 시가 변경되면 구 선택 초기화
  };

  const handleDistrictChange = (districtId: string) => {
    onChange(districtId);
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* 전체 버튼 */}
      <button
        onClick={() => {
          setSelectedCity('');
          onChange('');
        }}
        className={`px-4 py-2 text-[15px] font-semibold rounded-lg transition-all duration-200 ${
          !selectedCity && !selectedDistrictId
            ? 'text-white shadow-sm'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
        style={!selectedCity && !selectedDistrictId ? { backgroundColor: '#C85450' } : {}}
        onMouseEnter={(e) => {
          if (!selectedCity && !selectedDistrictId) {
            e.currentTarget.style.backgroundColor = '#b04946';
          }
        }}
        onMouseLeave={(e) => {
          if (!selectedCity && !selectedDistrictId) {
            e.currentTarget.style.backgroundColor = '#C85450';
          }
        }}
      >
        전체
      </button>

      {/* 시/도 선택 드롭다운 */}
      <select
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="px-4 py-2 text-[15px] font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white hover:border-gray-300 transition-colors cursor-pointer"
        style={{
          '--tw-ring-color': '#C85450'
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#C85450';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '';
        }}
      >
        <option value="">시/도 선택</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* 구/군 선택 드롭다운 (시/도가 선택된 경우에만 표시) */}
      {selectedCity && (
        <select
          value={selectedDistrictId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="px-4 py-2 text-[15px] font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white hover:border-gray-300 transition-colors cursor-pointer"
          style={{
            '--tw-ring-color': '#C85450'
          } as React.CSSProperties}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#C85450';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '';
          }}
        >
          <option value="">구/군 선택</option>
          {districtsInCity.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name} ({district.adCount})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
