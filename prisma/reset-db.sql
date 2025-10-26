-- Supabase DB 초기화 스크립트
-- 기존 프로젝트의 모든 테이블과 타입을 삭제합니다

-- 테이블 삭제 (외래키 제약조건 때문에 역순으로 삭제)
DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "videos" CASCADE;
DROP TABLE IF EXISTS "tax_invoices" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "refunds" CASCADE;
DROP TABLE IF EXISTS "receipts" CASCADE;
DROP TABLE IF EXISTS "purchases" CASCADE;
DROP TABLE IF EXISTS "progresses" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "notices" CASCADE;
DROP TABLE IF EXISTS "inquiry_replies" CASCADE;
DROP TABLE IF EXISTS "inquiries" CASCADE;
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "devices" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "course_files" CASCADE;
DROP TABLE IF EXISTS "bank_transfers" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Enum 타입 삭제
DROP TYPE IF EXISTS "TaxInvoiceStatus" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "RefundStatus" CASCADE;
DROP TYPE IF EXISTS "PurchaseStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "InquiryStatus" CASCADE;

-- 확인 메시지
SELECT 'Database has been reset successfully!' as message;
