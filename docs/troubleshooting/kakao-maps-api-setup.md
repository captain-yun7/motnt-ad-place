# 카카오맵 API 연동 문제 해결

## 문제 상황
- Next.js + react-kakao-maps-sdk 환경에서 카카오맵 API 연동 시도
- **403 Forbidden** 오류 발생
- 스크립트 로드 실패: `ReferenceError: kakao is not defined`

## 시도한 해결 방법들

### 1차 시도: 도메인 등록
**문제 진단**: API 키는 정상이지만 도메인 설정 누락으로 판단
**시도한 방법**: 
- 카카오 개발자 콘솔 → 앱 설정 → 플랫폼 → Web 플랫폼 추가
- 사이트 도메인에 `http://localhost:3000` 등록

**결과**: ❌ 여전히 403 Forbidden 오류 발생

### 2차 시도: API 키 형식 및 설정 확인
**시도한 방법**:
- JavaScript 키 vs REST API 키 확인
- 환경변수 설정 재확인
- 브라우저 캐시 클리어

**결과**: ❌ 계속해서 스크립트 로드 실패

### 3차 시도: 테스트 페이지 생성
**디버깅 방법**:
```html
<!-- public/test-kakao.html -->
<script>
var script = document.createElement('script');
script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_API_KEY';
script.onload = function() {
    console.log('✅ 스크립트 로드 성공');
};
script.onerror = function() {
    console.log('❌ 스크립트 로드 실패');
};
document.head.appendChild(script);
</script>
```

**결과**: 403 오류로 스크립트 로드 자체 실패 확인

## ✅ 최종 해결 방법

### 문제 원인: 2024년 12월 정책 변경
**카카오맵 API 활성화 설정이 필수**가 되었습니다.

### 해결 절차

#### 1단계: 카카오 개발자 콘솔 접속
- https://developers.kakao.com
- 로그인 후 "내 애플리케이션" 선택

#### 2단계: 새 테스트 앱 생성
- "애플리케이션 추가하기" 클릭
- 앱 이름: `motnt-ad-place-test` (또는 원하는 이름)
- 회사명: 적절히 입력

#### 3단계: 플랫폼 등록
- 앱 설정 → 플랫폼 → Web 플랫폼 등록
- 사이트 도메인: `http://localhost:3000`
- JavaScript 키 복사

#### 4단계: **카카오맵 활성화 설정** (핵심!)
- **제품 설정** → **카카오맵** 메뉴 이동
- **사용 설정** → **[ON]** 으로 변경
- ⚠️ 이 단계를 놓치면 403 오류 발생!

#### 5단계: API 키 적용
```bash
# .env.local
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=새로운_API_키
```

#### 6단계: 개발 서버 재시작
```bash
npm run dev
```

## 2024년 이후 정책 변경 사항

### 변경 전 (2024.12.01 이전)
- API 키 발급 + 도메인 등록만으로 사용 가능
- 별도 활성화 절차 불필요

### 변경 후 (2024.12.01 이후)
- API 키 발급 + 도메인 등록 + **카카오맵 활성화 설정** 필수
- 기존 앱도 추가 권한 신청 필요할 수 있음

## 검증 방법

### 1. 테스트 페이지로 확인
```
http://localhost:3000/test-kakao.html
```
- ✅ "카카오맵 렌더링 성공!" 메시지 확인
- ❌ 403 오류 시 활성화 설정 재확인

### 2. React 컴포넌트에서 확인
```
http://localhost:3000
```
- 지도 컴포넌트 정상 로딩
- 광고 마커 5개 표시

## 추가 팁

### 활성화 설정을 찾을 수 없는 경우
- 개발자 계정 정보 완성 (프로필, 연락처)
- 앱 기본 정보 충실히 작성 (아이콘, 설명)
- 경우에 따라 사업자 정보 필요할 수 있음

### API 할당량 관리
- 무료 할당량: 월 30만 호출
- 개발 초기에는 충분함
- 쿼터 초과 시 유료 전환 고려

## 관련 링크
- [카카오맵 API 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 콘솔](https://developers.kakao.com)
- [API 활성화 공지](https://devtalk.kakao.com/t/api/140875)

---

**작성일**: 2025-01-12  
**해결 완료**: ✅  
**소요 시간**: 약 2시간