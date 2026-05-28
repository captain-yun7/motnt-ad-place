/**
 * Supabase Storage → Cloudflare R2 이미지 마이그레이션
 *
 * 동작:
 *  1. AdImage 전체 조회
 *  2. R2 public URL 접두사로 이미 시작하는 항목은 스킵
 *  3. 기존 URL에서 파일을 fetch (Supabase public bucket 가정)
 *  4. 동일한 key(<adId>/<filename>)로 R2에 업로드
 *  5. DB의 url을 R2 public URL로 업데이트
 *
 * 실행:
 *   npx tsx scripts/migrate-images-to-r2.ts          # dry-run (기본)
 *   npx tsx scripts/migrate-images-to-r2.ts --apply  # 실제 반영
 */

import { PrismaClient } from '@prisma/client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL, r2PublicUrl } from '../src/lib/r2'

const APPLY = process.argv.includes('--apply')
const prisma = new PrismaClient()

function extractKeyFromSupabaseUrl(url: string): string | null {
  // 예: https://<proj>.supabase.co/storage/v1/object/public/motnt-ad-place-bucket/<adId>/<file>
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/')
    const bucketIdx = parts.findIndex((p) => p === 'motnt-ad-place-bucket')
    if (bucketIdx === -1 || bucketIdx === parts.length - 1) return null
    return parts.slice(bucketIdx + 1).join('/')
  } catch {
    return null
  }
}

async function main() {
  if (!R2_BUCKET || !R2_PUBLIC_URL) {
    console.error('R2_BUCKET / R2_PUBLIC_URL 환경변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`)
  console.log(`R2 bucket: ${R2_BUCKET}`)
  console.log(`R2 public: ${R2_PUBLIC_URL}`)
  console.log('')

  const images = await prisma.adImage.findMany({ orderBy: { createdAt: 'asc' } })
  console.log(`AdImage rows: ${images.length}`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const image of images) {
    if (image.url.startsWith(R2_PUBLIC_URL + '/')) {
      skipped++
      continue
    }

    const key = extractKeyFromSupabaseUrl(image.url)
    if (!key) {
      console.warn(`[skip] ${image.id} — key 추출 실패: ${image.url}`)
      skipped++
      continue
    }

    try {
      const res = await fetch(image.url)
      if (!res.ok) {
        console.error(`[fail] ${image.id} — fetch ${res.status}: ${image.url}`)
        failed++
        continue
      }
      const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
      const buf = Buffer.from(await res.arrayBuffer())
      const newUrl = r2PublicUrl(key)

      if (APPLY) {
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buf,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
        await prisma.adImage.update({
          where: { id: image.id },
          data: { url: newUrl },
        })
      }

      console.log(
        `[${APPLY ? 'ok' : 'plan'}] ${image.id} ${buf.length}B  ${key}  →  ${newUrl}`
      )
      migrated++
    } catch (e) {
      console.error(`[fail] ${image.id}:`, e)
      failed++
    }
  }

  console.log('')
  console.log(`Summary — migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}`)
  if (!APPLY) {
    console.log('Dry-run 입니다. 실제 반영하려면 --apply 옵션을 붙여 다시 실행하세요.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
