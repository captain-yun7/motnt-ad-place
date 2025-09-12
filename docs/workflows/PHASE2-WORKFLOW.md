# Phase 2: 데이터베이스 & API 기반 워크플로우

## 개요
- **목표**: 데이터 구조 설계 및 기본 API 구현
- **소요시간**: 약 1시간
- **상태**: ✅ 완료

## 진행한 작업들

### 1. 패키지 설치
```bash
npm install @supabase/supabase-js prisma @prisma/client
npm install -D prisma tsx
```

**설치된 패키지:**
- `@supabase/supabase-js`: Supabase 클라이언트
- `prisma`: Prisma ORM CLI
- `@prisma/client`: Prisma 클라이언트
- `tsx`: TypeScript 실행 도구

### 2. Prisma 초기화
```bash
npx prisma init
```

**생성된 파일:**
- `prisma/schema.prisma`: 데이터베이스 스키마
- `.env`: 환경 변수 파일

### 3. 환경 변수 템플릿 생성
**`.env.example` 생성:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=your-supabase-database-url

# Kakao Maps API
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-map-app-key
```

### 4. 데이터베이스 스키마 설계

**핵심 테이블:**
- `categories`: 광고 카테고리 (LED, 현수막, 버스정류장 등)
- `districts`: 지역 정보 (강남구, 서초구 등)
- `ads`: 메인 광고 테이블 (JSON 필드 활용)
- `ad_images`: 광고 이미지
- `admins`: 관리자 정보

**JSON 필드 활용:**
```prisma
model Ad {
  // 위치 정보 (JSON 필드로 유연성 확보)
  location    Json     // { address, coordinates: [lng, lat], landmarks }
  
  // 광고판 사양 (JSON 필드)
  specs       Json     // { type, size: "3x2", resolution, material }
  
  // 가격 정보 (JSON 필드)
  pricing     Json     // { monthly, deposit, minimumPeriod }
  
  // 추가 메타데이터 (확장 가능)
  metadata    Json?    // { traffic, visibility, nearbyBusinesses }
}
```

### 5. 라이브러리 파일 생성

**`src/lib/prisma.ts`:**
- Prisma 클라이언트 싱글톤
- 개발/프로덕션 환경 대응

**`src/lib/supabase.ts`:**
- Supabase 클라이언트 설정
- 일반 사용자용 / 관리자용 클라이언트 분리

### 6. TypeScript 타입 정의

**`src/types/ad.ts`:**
- `AdLocation`: 위치 정보 타입
- `AdSpecs`: 광고판 사양 타입  
- `AdPricing`: 가격 정보 타입
- `AdMetadata`: 메타데이터 타입
- `AdResponse`: API 응답 타입
- `AdFilters`, `AdSearchParams`: 검색/필터 타입

### 7. API 엔드포인트 구현

**`/api/ads` (GET):**
- 광고 목록 조회
- 검색, 필터링, 페이지네이션 지원
- 카테고리, 지역, 가격대별 필터

**`/api/ads/[id]` (GET):**
- 개별 광고 상세 조회
- ID 또는 slug로 조회 가능

**`/api/categories` (GET):**
- 카테고리 목록 조회
- 각 카테고리별 광고 개수 포함

**`/api/districts` (GET):**
- 지역 목록 조회
- 각 지역별 광고 개수 포함

### 8. 테스트 데이터 생성

**`prisma/seed.ts`:**
- 5개 카테고리 생성 (LED, 현수막, 버스정류장, 지하철역, 옥외간판)
- 8개 서울 주요 구 생성
- 5개 샘플 광고 데이터 (실제 서울 위치 기반)
- 각 광고당 2개 더미 이미지

**샘플 데이터:**
- 강남역 LED 전광판 A구역
- 홍대입구역 버스정류장 광고
- 잠실역 지하철 광고
- 명동 현수막 광고
- 이태원 옥외간판

### 9. package.json 스크립트 추가
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push", 
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 설계 특징

### 하이브리드 접근법
- **구조화된 핵심 데이터**: 관계형 테이블로 정규화
- **유연한 확장 데이터**: JSON 필드로 미래 확장성 확보
- **타입 안정성**: TypeScript 인터페이스로 JSON 구조 검증

### API 설계 원칙
- RESTful API 구조
- 페이지네이션 지원
- 풍부한 필터링 옵션
- 에러 처리 표준화

## 결과물
- ✅ PostgreSQL 기반 데이터베이스 스키마
- ✅ Prisma ORM 설정
- ✅ 완전한 CRUD API 엔드포인트
- ✅ TypeScript 타입 시스템
- ✅ 5개 카테고리, 8개 지역, 5개 샘플 광고 데이터
- ✅ Supabase 연결 준비

## 다음 단계
**Supabase 프로젝트 생성 필요:**
1. Supabase 계정 생성
2. 새 프로젝트 생성
3. 환경 변수 설정
4. `npm run db:push` - 스키마 마이그레이션
5. `npm run db:seed` - 테스트 데이터 주입

**Phase 3: 카카오맵 연동 및 지도 기능 구현**