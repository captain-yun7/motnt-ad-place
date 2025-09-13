# Supabase Storage 설정 가이드

이 문서는 MOTNT 프로젝트에서 이미지 업로드 기능을 사용하기 위한 Supabase Storage 설정 방법을 안내합니다.

## 개요

프로젝트에서는 광고 이미지 업로드를 위해 Supabase Storage를 사용합니다. 관리자가 광고를 생성하거나 수정할 때 이미지를 업로드할 수 있습니다.

## 1. Storage Bucket 생성

### 1.1 Supabase 콘솔 접속
1. [Supabase 대시보드](https://app.supabase.com)에 접속
2. MOTNT 프로젝트 선택 (`kkwuhihbhztfwjvhfaiz`)

### 1.2 Bucket 생성
1. 좌측 메뉴에서 **Storage** 클릭
2. **Create bucket** 버튼 클릭
3. 다음 설정으로 bucket 생성:
   - **Bucket name**: `motnt-ad-place-bucket`
   - **Public bucket**: ✅ 체크 (공개 읽기 허용)
   - **File size limit**: 10MB (기본값)
   - **Allowed MIME types**: `image/*` (모든 이미지 타입)
4. **Create bucket** 클릭

## 2. RLS (Row Level Security) 정책 설정

생성된 `motnt-ad-place-bucket` bucket에 대해 다음 보안 정책들을 설정해야 합니다.

### 2.1 읽기 정책 설정
1. `motnt-ad-place-bucket` bucket 클릭
2. **Configuration** 탭 클릭
3. **Add policy** → **Create policy** 클릭
4. 다음 정보 입력:
   ```
   Policy name: Public read access
   Allowed operation: SELECT
   Target roles: public
   Using expression: true
   ```
5. **Save policy** 클릭

### 2.2 업로드 정책 설정
1. **Add policy** → **Create policy** 클릭
2. 다음 정보 입력:
   ```
   Policy name: Authenticated users can upload
   Allowed operation: INSERT
   Target roles: authenticated
   Using expression: auth.role() = 'authenticated'
   ```
3. **Save policy** 클릭

### 2.3 삭제 정책 설정
1. **Add policy** → **Create policy** 클릭
2. 다음 정보 입력:
   ```
   Policy name: Authenticated users can delete
   Allowed operation: DELETE
   Target roles: authenticated
   Using expression: auth.role() = 'authenticated'
   ```
3. **Save policy** 클릭

## 3. 파일 구조

### 3.1 디렉토리 구조
```
motnt-ad-place-bucket/
├── {adId}/                    # 광고별 폴더
│   ├── {timestamp}-{random}.jpg
│   ├── {timestamp}-{random}.png
│   └── {timestamp}-{random}.gif
└── {adId}/
    ├── ...
```

### 3.2 파일명 규칙
- **형식**: `{timestamp}-{random}.{extension}`
- **예시**: `1705123456789-abc123def.jpg`
- **timestamp**: 업로드 시각 (밀리초)
- **random**: 6자리 랜덤 문자열
- **extension**: 원본 파일 확장자

## 4. 저장소 접근 정보

### 4.1 엔드포인트
- **Storage URL**: `https://kkwuhihbhztfwjvhfaiz.supabase.co/storage/v1`
- **S3 호환 엔드포인트**: `https://kkwuhihbhztfwjvhfaiz.storage.supabase.co/storage/v1/s3`

### 4.2 공개 URL 형식
```
https://kkwuhihbhztfwjvhfaiz.supabase.co/storage/v1/object/public/motnt-ad-place-bucket/{파일경로}
```

**예시**:
```
https://kkwuhihbhztfwjvhfaiz.supabase.co/storage/v1/object/public/motnt-ad-place-bucket/cmfhox9zm000warelkvadwz90/1705123456789-abc123def.jpg
```

## 5. 용량 및 제한사항

### 5.1 파일 제한
- **최대 파일 크기**: 10MB
- **허용 파일 타입**: image/* (jpg, jpeg, png, gif, webp 등)
- **동시 업로드**: 복수 파일 지원

### 5.2 보안 제한
- **읽기**: 모든 사용자 (공개)
- **업로드**: 인증된 사용자만
- **삭제**: 인증된 사용자만
- **수정**: 인증된 사용자만

## 6. API 사용 방법

### 6.1 이미지 업로드
```javascript
// 관리자 폼에서 자동 처리
POST /api/admin/images
Content-Type: multipart/form-data

FormData:
- images: File[]     # 업로드할 이미지 파일들
- adId: string      # 광고 ID
```

### 6.2 이미지 삭제
```javascript
// 관리자 폼에서 자동 처리
DELETE /api/admin/images/{imageId}
```

## 7. 테스트 방법

### 7.1 업로드 테스트
1. 관리자 계정으로 로그인 (test@motnt.kr)
2. 새 광고 생성 또는 기존 광고 수정
3. 이미지 파일 선택 후 업로드
4. Storage bucket에서 파일 확인

### 7.2 삭제 테스트
1. 광고 수정 페이지 접속
2. 기존 이미지에 마우스 올리기
3. × 버튼 클릭하여 삭제
4. Storage bucket에서 파일 삭제 확인

## 8. 문제 해결

### 8.1 업로드 실패
- **증상**: "이미지 업로드 실패" 오류
- **원인**: RLS 정책 미설정 또는 인증 실패
- **해결**: 위 정책 설정 재확인

### 8.2 이미지 표시 안됨
- **증상**: 업로드는 성공했지만 이미지가 표시되지 않음
- **원인**: Public 읽기 정책 미설정
- **해결**: "Public read access" 정책 확인

### 8.3 파일 크기 오류
- **증상**: "파일 크기가 너무 큽니다" 오류
- **원인**: 10MB 제한 초과
- **해결**: 더 작은 이미지 파일 사용

## 9. 모니터링

### 9.1 Storage 사용량 확인
1. Supabase 대시보드 → Settings → Usage
2. Storage 사용량 및 대역폭 확인

### 9.2 로그 확인
1. Supabase 대시보드 → Logs
2. Storage 관련 에러 로그 모니터링

---

**참고**: 이 설정은 개발/테스트 환경을 기준으로 작성되었습니다. 프로덕션 환경에서는 추가적인 보안 정책과 백업 전략이 필요할 수 있습니다.