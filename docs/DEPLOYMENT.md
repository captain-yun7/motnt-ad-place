# Motnt Ad Place - 배포 가이드

이 문서는 Motnt Ad Place 애플리케이션을 프로덕션 환경에 배포하는 방법을 안내합니다.

## 🚀 Vercel 배포 (권장)

### 1. Vercel 계정 준비
- [Vercel](https://vercel.com) 계정을 생성합니다
- GitHub 저장소와 연결합니다

### 2. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

#### 필수 환경 변수
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 데이터베이스
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# 애플리케이션
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Kakao Maps API
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-api-key
```

#### 선택적 환경 변수
```bash
# 프로덕션 최적화
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# 모니터링 (선택사항)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### 3. 배포 과정

#### Git을 통한 자동 배포
1. 코드를 GitHub에 푸시합니다
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. Vercel이 자동으로 빌드하고 배포합니다

#### Vercel CLI를 통한 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 배포
vercel --prod
```

### 4. 도메인 설정
- Vercel 대시보드에서 Custom Domain을 설정합니다
- DNS 레코드를 업데이트합니다

## 🔧 수동 배포

### 전제 조건
- Node.js 18+ 
- npm 또는 yarn
- Supabase 프로젝트 설정 완료

### 빌드 과정
```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npm run db:generate
npm run db:push

# 프로덕션 빌드
npm run build

# 서버 시작
npm start
```

## 📊 성능 최적화 확인

배포 후 다음 사항들을 확인하세요:

### 1. 번들 크기 분석
```bash
# 번들 분석 실행
npm run analyze
```

### 2. Lighthouse 점수 확인
- Performance: 90+ 목표
- Accessibility: 95+ 목표  
- Best Practices: 90+ 목표
- SEO: 95+ 목표

### 3. 이미지 최적화 확인
- Next.js Image 컴포넌트 사용 확인
- Supabase Storage 이미지 도메인 설정 확인

## 🔐 보안 설정

### HTTP 보안 헤더
`vercel.json`에서 설정된 보안 헤더들:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY  
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

### Supabase 보안
- Row Level Security (RLS) 정책 확인
- API 키 보안 관리
- 데이터베이스 접근 권한 검토

## 🚨 트러블슈팅

### 흔한 오류들

#### 1. 환경 변수 오류
```
Error: Missing environment variables
```
**해결책**: `.env.example`을 참조하여 모든 필수 환경 변수가 설정되었는지 확인

#### 2. 데이터베이스 연결 오류
```
Error: Connection refused
```
**해결책**: DATABASE_URL과 Supabase 프로젝트 상태 확인

#### 3. 이미지 로딩 오류
```
Error: Invalid src prop
```
**해결책**: `next.config.ts`의 이미지 도메인 설정 확인

#### 4. 빌드 오류
```
Error: Module not found
```
**해결책**: 
- `npm install` 재실행
- TypeScript 오류 확인
- Import 경로 검증

### 로그 확인 방법

#### Vercel 로그
```bash
# 배포 로그 확인
vercel logs your-deployment-url

# 실시간 로그
vercel logs --follow
```

#### 브라우저 개발자 도구
- Console 탭에서 JavaScript 오류 확인
- Network 탭에서 API 호출 상태 확인

## 📈 모니터링

### 성능 모니터링
- Vercel Analytics 활용
- Core Web Vitals 지표 추적
- Real User Monitoring (RUM) 데이터 분석

### 오류 추적
- Sentry 또는 Vercel Error Tracking 설정
- 사용자 피드백 채널 운영

## 🔄 CI/CD 파이프라인

### GitHub Actions (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test # 테스트 추가 시
```

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 적용
- [ ] 이미지 도메인 설정 확인  
- [ ] API 엔드포인트 테스트
- [ ] 빌드 오류 없음 확인
- [ ] 보안 설정 검토
- [ ] 성능 최적화 적용
- [ ] 에러 모니터링 설정

배포 후 확인사항:

- [ ] 홈페이지 로딩 확인
- [ ] 광고 목록 페이지 동작 확인
- [ ] 광고 상세 페이지 동작 확인
- [ ] 관리자 페이지 접근 및 기능 확인
- [ ] 지도 표시 정상 동작 확인
- [ ] 이미지 로딩 정상 확인
- [ ] 모바일 반응형 확인
- [ ] 성능 점수 확인

## 🆘 지원 및 문의

배포 과정에서 문제가 발생하면:
1. 이 문서의 트러블슈팅 섹션 확인
2. GitHub Issues에 문제 등록
3. 개발팀에 직접 문의

---

**참고 문서:**
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Setup](https://supabase.com/docs/guides/getting-started)