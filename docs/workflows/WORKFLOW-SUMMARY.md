# 개발 워크플로우 요약

## 프로젝트 개요
**Motnt Ad Place** - 한국 옥외광고 정보 플랫폼
- 옥외광고 위치, 가격, 상세정보를 지도 기반으로 제공
- Next.js 풀스택 + Supabase + Prisma + 카카오맵 API

## 완료된 Phase

### Phase 1: 프로젝트 기반 설정 ✅
**소요시간**: 30분  
**핵심 작업**:
- Next.js 14 + TypeScript + TailwindCSS 프로젝트 생성
- 폴더 구조 설정 (`src/components`, `src/lib`, `src/types`, `src/hooks`)
- Prettier 코드 포맷팅 설정
- Git 초기화 및 첫 커밋

**결과물**: 실행 가능한 기본 Next.js 앱

---

### Phase 2: 데이터베이스 & API 기반 ✅
**소요시간**: 1시간  
**핵심 작업**:
- Prisma ORM + PostgreSQL 스키마 설계
- JSON 필드 활용한 유연한 데이터 구조
- REST API 엔드포인트 구현 (`/api/ads`, `/api/categories`, `/api/districts`)
- TypeScript 타입 시스템 구축
- 테스트 데이터 (5개 카테고리, 8개 지역, 5개 샘플 광고) 생성

**결과물**: 완전한 백엔드 API + 데이터베이스 구조

---

### Phase 3: 카카오맵 연동 및 실제 DB 연결 ✅
**소요시간**: 3시간  
**핵심 작업**:
- react-kakao-maps-sdk 설치 및 Map 컴포넌트 구현
- 카카오맵 API 403 오류 해결 (2024년 정책 변경 대응)
- 메인 페이지 레이아웃 (헤더 + 사이드바 + 지도)
- Supabase 프로젝트 생성 및 실제 DB 연동
- Prisma 마이그레이션 및 시드 데이터 주입
- API를 더미 데이터에서 실제 DB로 변경

**결과물**: 실제 지도 기반 광고 조회 서비스 완성

---

## 현재 상태

### 📁 프로젝트 구조
```
motnt-ad-place/
├── src/
│   ├── app/
│   │   ├── api/              # API 엔드포인트
│   │   │   ├── ads/
│   │   │   ├── categories/
│   │   │   └── districts/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # React 컴포넌트
│   ├── lib/                 # 라이브러리 (prisma, supabase)
│   ├── types/               # TypeScript 타입
│   └── hooks/               # 커스텀 훅
├── prisma/
│   ├── schema.prisma        # 데이터베이스 스키마
│   └── seed.ts             # 시드 데이터
└── docs/                   # 프로젝트 문서
```

### 🗄️ 데이터베이스 스키마
- **categories**: 광고 유형 (LED, 현수막, 버스정류장 등)
- **districts**: 지역 정보 (서울 주요 구)
- **ads**: 메인 광고 테이블 (JSON 필드로 확장성 확보)
- **ad_images**: 광고 이미지
- **admins**: 관리자 정보

### 🔌 API 엔드포인트
- `GET /api/ads` - 광고 목록 (검색, 필터링, 페이지네이션)
- `GET /api/ads/[id]` - 광고 상세
- `GET /api/categories` - 카테고리 목록
- `GET /api/districts` - 지역 목록

### 📦 설치된 패키지
```json
{
  "dependencies": {
    "@prisma/client": "^6.16.1",
    "@supabase/supabase-js": "^2.57.4",
    "react-kakao-maps-sdk": "^1.2.0",
    "next": "15.5.3",
    "react": "19.1.0"
  },
  "devDependencies": {
    "prisma": "^6.16.1",
    "prettier": "^3.6.2",
    "tsx": "^4.20.5",
    "typescript": "^5"
  }
}
```

---

## 다음 단계 (진행 예정)

### Phase 4: 사용자 화면 고도화 (예상 1주)
- [ ] 검색 기능 실제 동작 연결
- [ ] 필터링 기능 구현 (카테고리, 지역, 가격대)
- [ ] 광고 상세 페이지 구현
- [ ] 마커 클릭 시 상세 정보 표시
- [ ] 광고 목록 페이지 (리스트뷰)

### Phase 5: 관리자 기능 (예상 1-2주)
- [ ] Supabase Auth 연동
- [ ] 관리자 대시보드
- [ ] 광고 관리 CRUD
- [ ] 이미지 업로드

### Phase 6: 최적화 & 배포 (예상 1주)
- [ ] 성능 최적화
- [ ] SEO 설정
- [ ] Vercel 배포

---

## 필요한 외부 서비스

### ✅ 설정 완료
- **Supabase 프로젝트**: https://kkwuhihbhztfwjvhfaiz.supabase.co
- **카카오 개발자**: Maps API 키 발급 완료

### 🟡 선택적 (나중에)
- **Vercel**: 배포 플랫폼
- **도메인**: 커스텀 도메인

---

## 빠른 시작 가이드

### 로컬 개발 실행
```bash
# 개발 서버 실행
npm run dev

# 데이터베이스 마이그레이션 (Supabase 연결 후)
npm run db:push

# 테스트 데이터 주입 (Supabase 연결 후)  
npm run db:seed
```

### 환경 변수 설정 (이미 완료)
`.env.local` 및 `.env` 파일 설정:
```env
# 카카오맵 API
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=dec2ef5dd8bdf2f0bee138d7fcaddbc7

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kkwuhihbhztfwjvhfaiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL="postgresql://postgres.kkwuhihbhztfwjvhfaiz:YpLHcXTt9q7jKB6v@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

---

## 개발 철학

### 기술적 선택 이유
1. **Next.js 풀스택**: 프론트엔드 + 백엔드 통합, 배포 간편
2. **Prisma + PostgreSQL**: 타입 안정성 + 관계형 DB 장점
3. **JSON 필드 활용**: 구조화 + 유연성 균형
4. **Supabase**: 빠른 개발 + 스케일링 가능

### 확장성 고려사항
- API 설계: RESTful 구조로 나중에 모바일 앱 연동 용이
- 데이터 구조: JSON 필드로 스키마 변경 없이 확장 가능
- 타입 시스템: TypeScript로 안전한 리팩토링 지원