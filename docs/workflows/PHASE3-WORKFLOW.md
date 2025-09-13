# Phase 3: 카카오맵 연동 및 실제 DB 연동 워크플로우

## 개요
- **목표**: 카카오맵 API 연동 + 실제 데이터베이스 연결 완성
- **소요시간**: 약 3시간
- **상태**: ✅ 완료

## 진행한 작업들

### 1. 카카오맵 API 연동

#### 1.1 패키지 설치
```bash
npm install react-kakao-maps-sdk
```

#### 1.2 환경변수 설정
```env
# .env.local
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=dec2ef5dd8bdf2f0bee138d7fcaddbc7
```

#### 1.3 Map 컴포넌트 구현
**파일**: `src/components/Map.tsx`
- `useKakaoLoader` 훅 사용
- 마커 표시 및 클릭 이벤트
- 확대/축소 컨트롤
- 로딩 및 오류 상태 처리

**주요 기능:**
- 광고 위치 마커 표시
- 마커 클릭 시 콜백 함수 실행
- 지도 경계 자동 조정
- 반응형 디자인

#### 1.4 메인 페이지 레이아웃 구현
**파일**: `src/app/page.tsx`
- 헤더 + 사이드바 + 지도 레이아웃
- 검색 및 필터링 UI
- API 데이터 로딩 상태 관리

### 2. 카카오맵 API 403 오류 해결

#### 2.1 문제 상황
- JavaScript 키 발급 후에도 403 Forbidden 오류
- 도메인 등록 완료했으나 여전히 스크립트 로드 실패

#### 2.2 원인 분석
**2024년 12월 정책 변경**: 카카오맵 API 활성화 설정 필수

#### 2.3 해결 과정
1. **테스트 페이지 생성**: `public/test-kakao.html`
2. **카카오 개발자 콘솔 재확인**:
   - 새 테스트 앱 생성
   - **제품 설정** → **카카오맵** → **사용 설정 [ON]**
3. **새 API 키 적용**: `dec2ef5dd8bdf2f0bee138d7fcaddbc7`

#### 2.4 문제 해결 가이드 작성
**파일**: `docs/troubleshooting/kakao-maps-api-setup.md`

### 3. 더미 데이터 구조화

#### 3.1 더미 데이터 파일 생성
**파일**: `docs/mock-data/ads.ts`
- 서울 5개 지역 실제 좌표 사용
- 다양한 광고 유형 (LED, 버스정류장, 지하철, 현수막, 옥외간판)
- 현실적인 가격대 (50만원 ~ 300만원)

#### 3.2 API를 더미 데이터로 연결
- `/api/ads` - 더미 데이터 조회
- `/api/ads/[id]` - 개별 광고 조회
- `/api/categories` - 카테고리 목록
- `/api/districts` - 지역 목록

### 4. 실제 데이터베이스 연동

#### 4.1 Supabase 프로젝트 생성
- **Project URL**: https://kkwuhihbhztfwjvhfaiz.supabase.co
- **Region**: Northeast Asia (Seoul)
- **Database Password**: YpLHcXTt9q7jKB6v

#### 4.2 환경변수 설정
```env
# .env & .env.local
NEXT_PUBLIC_SUPABASE_URL=https://kkwuhihbhztfwjvhfaiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL="postgresql://postgres.kkwuhihbhztfwjvhfaiz:YpLHcXTt9q7jKB6v@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

#### 4.3 Prisma 마이그레이션 문제 해결
**문제**: pgbouncer 연결 이슈로 `npx prisma db push` 무한 대기

**해결책**: 
- pgbouncer 파라미터 제거
- Direct connection 사용 (포트 5432)

```bash
npx prisma db push  # 성공!
```

#### 4.4 시드 데이터 주입
```bash
npm run db:seed
```

**생성된 데이터:**
- 5개 카테고리 (LED전광판, 현수막, 버스정류장, 지하철역, 옥외간판)
- 8개 서울 주요 구
- 5개 실제 위치 기반 광고 데이터
- 각 광고당 2개 이미지

#### 4.5 API를 실제 DB로 변경
- `src/app/api/ads/route.ts` - Prisma로 데이터 조회
- `src/app/api/ads/[id]/route.ts` - 개별 광고 조회
- `src/app/api/categories/route.ts` - 카테고리 조회
- `src/app/api/districts/route.ts` - 지역 조회

## 기술적 성과

### 카카오맵 통합
- ✅ React 컴포넌트 기반 지도 구현
- ✅ 실제 서울 좌표 기반 마커 표시
- ✅ 사용자 인터랙션 (확대/축소, 마커 클릭)
- ✅ 반응형 디자인

### 데이터베이스 아키텍처
- ✅ PostgreSQL + Prisma ORM
- ✅ JSON 필드 활용한 유연한 스키마
- ✅ 관계형 데이터 + NoSQL 장점 결합
- ✅ 실제 서비스 데이터 구조

### API 설계
- ✅ RESTful API 구조
- ✅ 페이지네이션 지원
- ✅ 검색 및 필터링 기능
- ✅ 에러 처리 및 타입 안정성

## 해결한 주요 문제들

### 1. 카카오맵 API 403 오류
**원인**: 2024년 12월 정책 변경으로 API 활성화 설정 필수
**해결**: 카카오 개발자 콘솔에서 카카오맵 사용 설정 활성화

### 2. Prisma 연결 이슈
**원인**: pgbouncer 모드에서 일부 Prisma 명령어 호환성 문제
**해결**: Direct connection 사용

### 3. 환경변수 로딩 문제
**원인**: Prisma는 .env.local이 아닌 .env 파일 우선 로딩
**해결**: .env 파일 생성 및 DATABASE_URL 설정

## 결과물

### 완성된 기능
- ✅ 실시간 지도 기반 광고 조회
- ✅ 5개 실제 서울 위치 마커 표시
- ✅ 완전한 백엔드 데이터베이스 연동
- ✅ 검색 및 필터링 UI (동작 준비 완료)

### 데이터 현황
- **총 5개 광고**: 강남역, 홍대, 잠실역, 명동, 이태원
- **5개 카테고리**: LED전광판, 현수막, 버스정류장, 지하철역, 옥외간판
- **8개 지역**: 강남구, 마포구, 송파구, 중구, 용산구 등
- **실제 좌표**: dukplace.com 참조하여 정확한 서울 위치

## 다음 단계 (Phase 4 준비)

### 사용자 화면 고도화
- 검색 기능 실제 동작 연결
- 필터링 기능 구현
- 광고 상세 페이지 구현
- 마커 클릭 시 상세 정보 표시

### 성능 최적화
- 이미지 로딩 최적화
- 지도 성능 튜닝
- API 응답 캐싱

---

**작성일**: 2025-01-12  
**Phase 3 완료**: ✅  
**소요 시간**: 약 3시간  
**다음 단계**: Phase 4 - 사용자 화면 구현