# Phase 1: 프로젝트 기반 설정 워크플로우

## 개요
- **목표**: 개발 환경 구축 및 기본 프로젝트 구조 완성
- **소요시간**: 약 30분
- **상태**: ✅ 완료

## 진행한 작업들

### 1. Next.js 14 프로젝트 생성
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

**생성된 구조:**
- TypeScript 활성화
- TailwindCSS 설정
- ESLint 설정
- App Router 사용
- src 디렉토리 구조
- Turbopack 활성화

### 2. 폴더 구조 설정
```bash
mkdir -p src/components src/lib src/types src/hooks
mkdir -p docs && mv MILESTONES.md REQUIREMENTS.md docs/
```

**최종 폴더 구조:**
```
src/
├── app/          # Next.js App Router
├── components/   # React 컴포넌트
├── lib/         # 유틸리티 라이브러리
├── types/       # TypeScript 타입 정의
└── hooks/       # React 커스텀 훅
docs/            # 프로젝트 문서
```

### 3. 코드 포맷팅 설정
```bash
npm install --save-dev prettier
```

**생성된 파일:**
- `.prettierrc` - Prettier 설정
- `.prettierignore` - 제외할 파일들

**Prettier 설정:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 4. Git 초기화
```bash
git init
git config user.email "dev@motnt-ad-place.local"
git config user.name "Motnt Dev"
```

**.gitignore 업데이트:**
- Prisma 관련 파일
- IDE 설정 파일
- OS 관련 파일

### 5. 개발 서버 테스트
```bash
npm run dev
```

**결과:** http://localhost:3000 에서 정상 동작 확인

### 6. 초기 커밋
```bash
git add .
git commit -m "Initial commit: Next.js 14 + TypeScript + TailwindCSS setup"
```

## 결과물
- ✅ 실행 가능한 Next.js 애플리케이션
- ✅ TypeScript + TailwindCSS 환경
- ✅ 일관된 코드 포맷팅 설정
- ✅ Git 버전 관리 시작
- ✅ 체계적인 폴더 구조

## 다음 단계
Phase 2: 데이터베이스 & API 기반 구축