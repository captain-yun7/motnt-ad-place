import { Ad, Category, District, AdImage } from '@prisma/client';

// 광고 위치 정보 타입
export interface AdLocation {
  address: string;
  coordinates: [number, number]; // [lng, lat]
  landmarks?: string[];
  district?: string;  
}

// 광고판 사양 타입
export interface AdSpecs {
  type: string; // LED, 현수막, 간판 등
  size: string; // "3m x 2m"
  width?: string;
  height?: string;
  brightness?: string;
  resolution?: string;
  material?: string;
  installation?: string;
}

// 가격 정보 타입
export interface AdPricing {
  monthly: number;
  deposit?: number;
  setup?: number;  
  design?: number;
  minimumPeriod: number; // 최소 계약 기간 (월)
  currency: string;    
}

// 메타데이터 타입
export interface AdMetadata {
  traffic?: string; // 유동인구 정보
  visibility?: string; // 시야성 정보
  nearbyBusinesses?: string[];
  operatingHours?: string;
  restrictions?: string[];
}

// 완전한 광고 정보 (관계 포함)
export type AdWithDetails = Ad & {
  category: Category;
  district: District;
  images: AdImage[];
};

// API 응답용 광고 타입
export interface AdResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: AdLocation | null;
  specs: AdSpecs;
  pricing: AdPricing;
  metadata?: AdMetadata;
  isActive?: boolean,  
  category: {
    id: string;
    name: string;
  };
  district: {
    id: string;
    name: string;
    city: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 광고 필터 타입
export interface AdFilters {
  category?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  type?: string;
}

// 광고 검색 파라미터
export interface AdSearchParams extends AdFilters {
  query?: string;
  page?: number;
  limit?: number;
  sort?: 'price' | 'date' | 'title';
  order?: 'asc' | 'desc';
}