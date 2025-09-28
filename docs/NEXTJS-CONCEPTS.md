# Next.js 핵심 개념 정리

이 문서는 Motnt Ad Place 프로젝트의 Phase 6 최적화 작업에서 사용된 Next.js 15의 주요 개념들을 정리한 학습 자료입니다.

## 목차
1. [이미지 최적화 (Next.js Image)](#1-이미지-최적화-nextjs-image)
2. [코드 분할과 지연 로딩](#2-코드-분할과-지연-로딩)
3. [SEO와 메타데이터](#3-seo와-메타데이터)
4. [Loading과 Suspense](#4-loading과-suspense)
5. [에러 처리와 Error Boundaries](#5-에러-처리와-error-boundaries)
6. [API Routes와 서버 컴포넌트](#6-api-routes와-서버-컴포넌트)
7. [Vercel 배포와 환경 설정](#7-vercel-배포와-환경-설정)
8. [번들 분석과 최적화](#8-번들-분석과-최적화)

---

## 1. 이미지 최적화 (Next.js Image)

### 개념
Next.js의 `Image` 컴포넌트는 자동으로 이미지를 최적화해주는 내장 컴포넌트입니다.

### 기존 코드 vs 최적화된 코드

**❌ 기존 코드**
```jsx
<img 
  src="https://picsum.photos/800/600" 
  alt="광고 이미지"
  className="w-full h-64 object-cover"
/>
```

**✅ 최적화된 코드**
```jsx
import Image from 'next/image';

<Image 
  src="https://picsum.photos/800/600" 
  alt="광고 이미지"
  width={800}
  height={600}
  className="w-full h-64 object-cover"
  priority // 중요한 이미지의 경우
/>
```

### 주요 기능
- **자동 포맷 변환**: WebP, AVIF 등 최적 포맷으로 자동 변환
- **레이지 로딩**: 뷰포트에 진입할 때까지 로딩 지연
- **반응형 이미지**: 디바이스별 최적 크기 제공
- **CLS 방지**: 이미지 로딩으로 인한 레이아웃 이동 방지

### next.config.ts 설정
```typescript
const nextConfig = {
  images: {
    domains: ['picsum.photos'], // 허용된 이미지 도메인
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

---

## 2. 코드 분할과 지연 로딩

### 개념
큰 컴포넌트를 필요할 때만 로딩하여 초기 번들 크기를 줄이는 기술입니다.

### React.lazy 사용법

**컴포넌트 지연 로딩**
```jsx
import { lazy, Suspense } from 'react';

// 무거운 지도 컴포넌트를 지연 로딩
const Map = lazy(() => import('@/components/Map'));

function AdDetailPage() {
  return (
    <div>
      <h1>광고 상세</h1>
      <Suspense fallback={<div>지도를 불러오는 중...</div>}>
        <Map />
      </Suspense>
    </div>
  );
}
```

### Dynamic Import로 조건부 로딩
```jsx
import dynamic from 'next/dynamic';

// 클라이언트에서만 실행되는 컴포넌트
const ClientOnlyComponent = dynamic(
  () => import('@/components/ClientOnly'),
  { ssr: false }
);
```

### 장점
- **초기 로딩 속도 향상**: 필요한 코드만 먼저 로딩
- **메모리 효율성**: 사용하지 않는 컴포넌트는 메모리에 로딩하지 않음
- **사용자 경험 개선**: 빠른 페이지 렌더링

---

## 3. SEO와 메타데이터

### Next.js 15의 메타데이터 API

**정적 메타데이터**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Motnt Ad Place',
  description: '옥외광고 플랫폼',
  openGraph: {
    title: 'Motnt Ad Place',
    description: '옥외광고 플랫폼',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motnt Ad Place',
    description: '옥외광고 플랫폼',
    images: ['/og-image.jpg'],
  },
};
```

**동적 메타데이터**
```typescript
// app/ad/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ad = await getAdData(params.id);
  
  return {
    title: `${ad.title} | Motnt Ad Place`,
    description: ad.description,
    openGraph: {
      title: ad.title,
      description: ad.description,
      images: ad.images,
    },
  };
}
```

### Viewport 설정 (Next.js 15 변경사항)
```typescript
// app/layout.tsx - metadata와 분리됨
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
```

---

## 4. Loading과 Suspense

### 개념
비동기 작업 중에 표시할 로딩 UI를 정의하는 React의 기능입니다.

### Suspense 경계 설정
```jsx
import { Suspense } from 'react';
import SkeletonLoader from '@/components/SkeletonLoader';

function AdListPageContent() {
  const searchParams = useSearchParams(); // 이 훅은 Suspense 경계가 필요
  // 컴포넌트 로직...
}

export default function AdListPage() {
  return (
    <Suspense fallback={<SkeletonLoader type="list" count={5} />}>
      <AdListPageContent />
    </Suspense>
  );
}
```

### Skeleton 로더 구현
```jsx
// components/SkeletonLoader.tsx
interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'detail' | 'table';
  count?: number;
}

export default function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
  
  // 타입별로 다른 스켈레톤 반환...
}
```

---

## 5. 에러 처리와 Error Boundaries

### Error Boundary 컴포넌트
```jsx
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>문제가 발생했습니다.</div>;
    }

    return this.props.children;
  }
}
```

### API 에러 처리
```typescript
// app/api/categories/route.ts
export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error) 
          : undefined
      },
      { status: 500 }
    );
  }
}
```

---

## 6. API Routes와 서버 컴포넌트

### API Routes 구조
```
app/
├── api/
│   ├── categories/
│   │   └── route.ts        # GET /api/categories
│   ├── districts/
│   │   └── route.ts        # GET /api/districts
│   └── ads/
│       ├── route.ts        # GET /api/ads
│       └── [id]/
│           └── route.ts    # GET /api/ads/[id]
```

### HTTP 메서드별 처리
```typescript
// app/api/ads/route.ts
export async function GET(request: Request) {
  // 광고 목록 조회
}

export async function POST(request: Request) {
  // 새 광고 생성
}

// app/api/ads/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 특정 광고 조회
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 광고 수정
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 광고 삭제
}
```

---

## 7. Vercel 배포와 환경 설정

### vercel.json 설정
```json
{
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 환경변수 설정 주의사항
- **로컬 개발**: `.env` 파일에 따옴표 포함
- **Vercel 배포**: 환경변수에 따옴표 제외

```bash
# .env (로컬)
DATABASE_URL="postgresql://user:pass@host:port/db"

# Vercel Dashboard (프로덕션)
DATABASE_URL=postgresql://user:pass@host:port/db
```

---

## 8. 번들 분석과 최적화

### Bundle Analyzer 설정
```typescript
// next.config.ts
const nextConfig = {
  // 번들 분석기 설정
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
};
```

### 사용법
```bash
# 번들 분석 실행
ANALYZE=true npm run build

# 또는 @next/bundle-analyzer 사용
npm install --save-dev @next/bundle-analyzer
```

### 최적화 기법
1. **동적 임포트**: 큰 라이브러리를 필요할 때만 로딩
2. **Tree Shaking**: 사용하지 않는 코드 제거
3. **이미지 최적화**: Next.js Image 컴포넌트 활용
4. **폰트 최적화**: next/font로 웹폰트 최적화

---

## 성능 모니터링

### 에러 모니터링 시스템
```typescript
// lib/monitoring.ts
export const logError = (
  error: Error,
  context: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    severity,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // 콘솔에 로깅
  console.error(`[${severity.toUpperCase()}] ${context}:`, errorData);
  
  // 프로덕션에서는 외부 모니터링 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Sentry, DataDog 등으로 전송
  }
};
```

---

## 접근성 (Accessibility)

### ARIA 속성과 시맨틱 HTML
```jsx
// 접근성이 개선된 컴포넌트
<main id="main-content" role="main">
  <h1>광고 목록</h1>
  <nav aria-label="필터 옵션">
    <select aria-label="카테고리 선택">
      <option value="">전체 카테고리</option>
    </select>
  </nav>
  
  <section aria-live="polite" aria-busy={loading}>
    {loading ? (
      <div role="status" aria-label="로딩 중">
        <SkeletonLoader type="list" count={5} />
      </div>
    ) : (
      <div role="list">
        {ads.map(ad => (
          <article key={ad.id} role="listitem">
            <h2>{ad.title}</h2>
          </article>
        ))}
      </div>
    )}
  </section>
</main>
```

### 키보드 네비게이션
```jsx
// 바로가기 링크
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      본문으로 바로가기
    </a>
  );
}
```

---

## 학습 포인트

### 이 프로젝트에서 배울 수 있는 것들:

1. **Next.js 15의 새로운 기능들**
   - 새로운 메타데이터 API
   - 개선된 이미지 최적화
   - Server Components와 Client Components 구분

2. **성능 최적화 기법들**
   - 코드 분할과 지연 로딩
   - 이미지 최적화
   - 번들 크기 최적화

3. **사용자 경험(UX) 개선**
   - 로딩 상태 관리
   - 에러 처리
   - 접근성 개선

4. **배포와 모니터링**
   - Vercel 배포 최적화
   - 환경변수 관리
   - 에러 모니터링

### 추천 학습 순서:
1. Next.js 공식 문서의 App Router 섹션
2. React Suspense와 Error Boundaries
3. 웹 성능 최적화 기법들
4. 웹 접근성 가이드라인 (WCAG)
5. Vercel 배포와 환경 설정

이 개념들을 차례대로 학습하시면 모던 웹 개발의 핵심 기술들을 체계적으로 익힐 수 있습니다.