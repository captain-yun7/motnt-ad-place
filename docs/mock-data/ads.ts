import { AdResponse, AdStatus } from '@/types/ad';

export const MOCK_ADS: AdResponse[] = [
  {
    id: '1',
    title: '강남역 LED 전광판 A구역',
    slug: 'gangnam-led-a',
    description: '강남역 2번 출구 정면 대형 LED 전광판입니다.',
    location: {
      address: '서울시 강남구 강남대로 396',
      coordinates: [127.027926, 37.497954],
      landmarks: ['강남역', '강남역사거리', 'CGV 강남'],
      district: '강남구'
    },
    specs: {
      type: 'LED 전광판',
      size: '10m x 3m',
      resolution: '1920x576',
      material: 'LED',
      installation: '건물 외벽'
    },
    pricing: {
      monthly: 3000000,
      deposit: 1000000,
      minimumPeriod: 3,
      currency: 'KRW'
    },
    metadata: {
      traffic: '일평균 10만명 이상',
      visibility: '매우 좋음',
      nearbyBusinesses: ['강남역', 'CGV', '스타벅스', '맥도날드'],
      operatingHours: '24시간',
      restrictions: ['음주 광고 불가', '의료 광고 제한']
    },
    category: {
      id: 'cat-1',
      name: 'LED 전광판'
    },
    district: {
      id: 'dist-1',
      name: '강남구',
      city: '서울'
    },
    images: [
      {
        id: 'img-1-1',
        url: 'https://picsum.photos/800/600?random=1',
        alt: '강남역 LED 전광판 메인 이미지',
        order: 0
      },
      {
        id: 'img-1-2',
        url: 'https://picsum.photos/800/600?random=2',
        alt: '강남역 LED 전광판 측면 뷰',
        order: 1
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: true,
    tags: ['LED', '강남역', '전광판'],
    viewCount: 1250,
    favoriteCount: 48,
    inquiryCount: 15,
    verified: true,
    verifiedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: '홍대입구역 버스정류장 광고',
    slug: 'hongdae-bus-stop',
    description: '홍대입구역 인근 주요 버스정류장 광고판입니다.',
    location: {
      address: '서울시 마포구 양화로 160',
      coordinates: [126.924910, 37.556628],
      landmarks: ['홍대입구역', '홍익대학교', '홍대거리'],
      district: '마포구'
    },
    specs: {
      type: '버스정류장 광고판',
      size: '2m x 1.2m',
      material: '후면조명 필름',
      installation: '버스정류장'
    },
    pricing: {
      monthly: 800000,
      deposit: 300000,
      minimumPeriod: 6,
      currency: 'KRW'
    },
    metadata: {
      traffic: '일평균 5만명',
      visibility: '좋음',
      nearbyBusinesses: ['홍익대학교', '클럽', '카페', '음식점'],
      operatingHours: '24시간',
      restrictions: []
    },
    category: {
      id: 'cat-2',
      name: '버스정류장'
    },
    district: {
      id: 'dist-2',
      name: '마포구',
      city: '서울'
    },
    images: [
      {
        id: 'img-2-1',
        url: 'https://picsum.photos/800/600?random=3',
        alt: '홍대입구역 버스정류장 광고 메인',
        order: 0
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: false,
    tags: ['버스정류장', '홍대', '청춘'],
    viewCount: 890,
    favoriteCount: 32,
    inquiryCount: 8,
    verified: true,
    verifiedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: '잠실역 지하철 광고',
    slug: 'jamsil-subway-ad',
    description: '잠실역 대합실 메인 광고 공간입니다.',
    location: {
      address: '서울시 송파구 올림픽로 지하 265',
      coordinates: [127.100311, 37.513292],
      landmarks: ['잠실역', '롯데월드', '잠실야구장'],
      district: '송파구'
    },
    specs: {
      type: '지하철 광고판',
      size: '5m x 2m',
      material: '후면조명 필름',
      installation: '지하철 대합실'
    },
    pricing: {
      monthly: 1500000,
      deposit: 500000,
      minimumPeriod: 3,
      currency: 'KRW'
    },
    metadata: {
      traffic: '일평균 15만명',
      visibility: '매우 좋음',
      nearbyBusinesses: ['롯데월드', '롯데백화점', '잠실야구장'],
      operatingHours: '첫차-막차',
      restrictions: ['지하철공사 심의 필요']
    },
    category: {
      id: 'cat-3',
      name: '지하철역'
    },
    district: {
      id: 'dist-3',
      name: '송파구',
      city: '서울'
    },
    images: [
      {
        id: 'img-3-1',
        url: 'https://picsum.photos/800/600?random=4',
        alt: '잠실역 지하철 광고 메인',
        order: 0
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: true,
    tags: ['지하철', '잠실', '롯데월드'],
    viewCount: 2100,
    favoriteCount: 65,
    inquiryCount: 22,
    verified: true,
    verifiedAt: '2024-01-03T00:00:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    title: '명동 현수막 광고',
    slug: 'myeongdong-banner',
    description: '명동 메인스트리트 현수막 광고 위치입니다.',
    location: {
      address: '서울시 중구 명동길 26',
      coordinates: [126.981893, 37.563692],
      landmarks: ['명동역', '명동성당', '롯데백화점'],
      district: '중구'
    },
    specs: {
      type: '현수막',
      size: '8m x 1m',
      material: '배너천',
      installation: '가로등 현수막'
    },
    pricing: {
      monthly: 500000,
      deposit: 200000,
      minimumPeriod: 1,
      currency: 'KRW'
    },
    metadata: {
      traffic: '일평균 8만명',
      visibility: '좋음',
      nearbyBusinesses: ['명동성당', '롯데백화점', '쇼핑몰'],
      operatingHours: '24시간',
      restrictions: ['구청 허가 필요']
    },
    category: {
      id: 'cat-4',
      name: '현수막'
    },
    district: {
      id: 'dist-4',
      name: '중구',
      city: '서울'
    },
    images: [
      {
        id: 'img-4-1',
        url: 'https://picsum.photos/800/600?random=5',
        alt: '명동 현수막 광고 메인',
        order: 0
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: false,
    tags: ['현수막', '명동', '쇼핑'],
    viewCount: 650,
    favoriteCount: 18,
    inquiryCount: 5,
    verified: true,
    verifiedAt: '2024-01-04T00:00:00Z',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    title: '이태원 옥외간판',
    slug: 'itaewon-outdoor-sign',
    description: '이태원 메인스트리트 건물 외벽 간판 광고입니다.',
    location: {
      address: '서울시 용산구 이태원로 200',
      coordinates: [126.994041, 37.534567],
      landmarks: ['이태원역', '해밀톤호텔', 'N서울타워'],
      district: '용산구'
    },
    specs: {
      type: '옥외간판',
      size: '6m x 2m',
      material: 'LED 백라이트',
      installation: '건물 외벽'
    },
    pricing: {
      monthly: 1200000,
      deposit: 400000,
      minimumPeriod: 6,
      currency: 'KRW'
    },
    metadata: {
      traffic: '일평균 6만명',
      visibility: '매우 좋음',
      nearbyBusinesses: ['외국인 관광지', '레스토랑', '바'],
      operatingHours: '24시간',
      restrictions: ['구청 간판 심의 필요']
    },
    category: {
      id: 'cat-5',
      name: '옥외간판'
    },
    district: {
      id: 'dist-5',
      name: '용산구',
      city: '서울'
    },
    images: [
      {
        id: 'img-5-1',
        url: 'https://picsum.photos/800/600?random=6',
        alt: '이태원 옥외간판 메인',
        order: 0
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: false,
    tags: ['옥외간판', '이태원', '외국인'],
    viewCount: 420,
    favoriteCount: 12,
    inquiryCount: 3,
    verified: true,
    verifiedAt: '2024-01-05T00:00:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    title: '강남대로 점프밀라노 LED 전광판',
    slug: 'gangnam-jumpmilano-led',
    description: '강남대로 역삼동 횡단보도 전면위치 대형 LED 전광판. 장시간 메세지 노출 및 독보적인 주목도와 가시성을 자랑합니다.',
    location: {
      address: '서울시 강남구 역삼동 815번지',
      coordinates: [127.029, 37.498],
      landmarks: ['강남역', '역삼역', '강남대로'],
      district: '강남구'
    },
    specs: {
      type: 'LED 전광판',
      size: '18m x 8.7m',
      width: '18m',
      height: '8.7m',
      material: 'LED',
      installation: '건물 외벽',
      updateFrequency: '1일 100회 이상'
    },
    pricing: {
      monthly: 15000000,
      weekly: 4200000,
      daily: 1800000,
      deposit: 3000000,
      minimumPeriod: 1,
      currency: 'KRW',
      discounts: {
        '3days': 0,
        '7days': 0
      },
      additionalCosts: {
        threeDay: 5400000
      }
    },
    metadata: {
      traffic: '횡단보도 전면위치로 장시간 노출',
      visibility: '매우 높음 - 강남대로 낮은 위치 설치',
      nearbyBusinesses: ['강남역', '역삼역', '강남대로 상권'],
      operatingHours: '24시간',
      restrictions: []
    },
    category: {
      id: 'cat-1',
      name: 'LED 전광판'
    },
    district: {
      id: 'dist-1',
      name: '강남구',
      city: '서울'
    },
    images: [
      {
        id: 'img-6-1',
        url: '/ads/gangnam-jumpmilano-main.jpg',
        alt: '강남대로 점프밀라노 LED 전광판 야간 뷰',
        order: 0
      },
      {
        id: 'img-6-2',
        url: '/ads/gangnam-jumpmilano-map.jpg',
        alt: '강남대로 점프밀라노 위치 지도',
        order: 1
      }
    ],
    status: 'AVAILABLE' as AdStatus,
    featured: true,
    tags: ['LED', '강남', '대형전광판', '횡단보도'],
    viewCount: 0,
    favoriteCount: 0,
    inquiryCount: 0,
    verified: true,
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'LED 전광판', description: '디지털 LED 전광판 광고', adCount: 2 },
  { id: 'cat-2', name: '버스정류장', description: '버스정류장 광고판', adCount: 1 },
  { id: 'cat-3', name: '지하철역', description: '지하철역 내부 광고', adCount: 1 },
  { id: 'cat-4', name: '현수막', description: '현수막 광고', adCount: 1 },
  { id: 'cat-5', name: '옥외간판', description: '건물 외벽 간판', adCount: 1 }
];

export const MOCK_DISTRICTS = [
  { id: 'dist-1', name: '강남구', city: '서울', adCount: 2 },
  { id: 'dist-2', name: '마포구', city: '서울', adCount: 1 },
  { id: 'dist-3', name: '송파구', city: '서울', adCount: 1 },
  { id: 'dist-4', name: '중구', city: '서울', adCount: 1 },
  { id: 'dist-5', name: '용산구', city: '서울', adCount: 1 }
];