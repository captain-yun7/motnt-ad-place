/**
 * public/ads/ → Cloudflare R2 일괄 이관
 *
 * 동작:
 *   1. public/ads/ 디렉토리의 모든 파일을 R2의 `ads/<filename>` 키로 업로드
 *      (R2에 이미 존재하면 스킵)
 *   2. AdImage 전체 조회 후 url이 `/ads/<filename>` 형식이면
 *      `<R2_PUBLIC_URL>/ads/<filename>` 으로 일괄 갱신
 *   3. 이미 R2 URL이거나, /ads/ prefix가 아닌 url은 스킵
 *
 * 실행:
 *   npx tsx --env-file=.env.local scripts/migrate-images-to-r2.ts            # dry-run
 *   npx tsx --env-file=.env.local scripts/migrate-images-to-r2.ts --apply    # 실제 반영
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import {
  PutObjectCommand,
  HeadObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL, r2PublicUrl } from '../src/lib/r2'

const APPLY = process.argv.includes('--apply')
const prisma = new PrismaClient()
const PUBLIC_ADS_DIR = path.resolve(process.cwd(), 'public/ads')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

function r2KeyForFilename(filename: string) {
  return `ads/${filename}`
}

async function r2HasKey(key: string) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch (e) {
    if (e instanceof S3ServiceException && e.$metadata.httpStatusCode === 404) {
      return false
    }
    throw e
  }
}

async function uploadFiles() {
  const files = await fs.readdir(PUBLIC_ADS_DIR)
  console.log(`public/ads/ 파일 ${files.length}개 발견`)

  let uploaded = 0
  let already = 0
  let failed = 0

  for (const filename of files) {
    const filePath = path.join(PUBLIC_ADS_DIR, filename)
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) continue

    const ext = path.extname(filename).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'
    const key = r2KeyForFilename(filename)

    try {
      if (await r2HasKey(key)) {
        already++
        continue
      }

      if (APPLY) {
        const body = await fs.readFile(filePath)
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
        console.log(`[ok]   ${key}  (${stat.size}B)`)
      } else {
        console.log(`[plan] ${key}  (${stat.size}B)`)
      }
      uploaded++
    } catch (e) {
      console.error(`[fail] ${key}:`, e)
      failed++
    }
  }

  console.log(`업로드 — ${APPLY ? 'uploaded' : 'planned'}: ${uploaded}, already: ${already}, failed: ${failed}`)
  return { uploaded, already, failed }
}

function extractSupabaseKey(url: string): string | null {
  // 예: https://<proj>.supabase.co/storage/v1/object/public/motnt-ad-place-bucket/<adId>/<file>
  try {
    const u = new URL(url)
    if (!u.hostname.endsWith('.supabase.co')) return null
    const parts = u.pathname.split('/')
    const idx = parts.findIndex((p) => p === 'motnt-ad-place-bucket')
    if (idx === -1 || idx === parts.length - 1) return null
    return parts.slice(idx + 1).join('/')
  } catch {
    return null
  }
}

async function migrateSupabaseUrl(url: string): Promise<string | null> {
  const subKey = extractSupabaseKey(url)
  if (!subKey) return null
  const r2Key = `uploads/${subKey}`

  if (!(await r2HasKey(r2Key))) {
    if (!APPLY) return r2PublicUrl(r2Key)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetch ${res.status}: ${url}`)
    const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
    const body = Buffer.from(await res.arrayBuffer())
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )
    console.log(`[ok]   ${r2Key}  (${body.length}B, from Supabase)`)
  }

  return r2PublicUrl(r2Key)
}

async function updateDbUrls() {
  const rows = await prisma.adImage.findMany({ orderBy: { createdAt: 'asc' } })
  console.log(`\nAdImage rows: ${rows.length}`)

  let toUpdate = 0
  let alreadyR2 = 0
  let externalKept = 0
  let unknown = 0

  for (const row of rows) {
    if (R2_PUBLIC_URL && row.url.startsWith(R2_PUBLIC_URL + '/')) {
      alreadyR2++
      continue
    }

    let newUrl: string | null = null

    if (row.url.startsWith('/ads/')) {
      const filename = row.url.slice('/ads/'.length)
      newUrl = r2PublicUrl(r2KeyForFilename(filename))
    } else if (row.url.includes('.supabase.co')) {
      try {
        newUrl = await migrateSupabaseUrl(row.url)
      } catch (e) {
        console.error(`[fail-supabase] ${row.id}:`, e)
      }
    } else if (row.url.startsWith('https://picsum.photos/')) {
      externalKept++
      continue
    } else {
      console.warn(`[unknown-url] ${row.id}: ${row.url}`)
      unknown++
      continue
    }

    if (!newUrl) {
      unknown++
      continue
    }

    if (APPLY) {
      await prisma.adImage.update({ where: { id: row.id }, data: { url: newUrl } })
    } else {
      console.log(`[plan-db] ${row.id}  ${row.url}  →  ${newUrl}`)
    }
    toUpdate++
  }

  console.log(
    `DB url — ${APPLY ? 'updated' : 'plan'}: ${toUpdate}, already-r2: ${alreadyR2}, picsum-kept: ${externalKept}, unknown: ${unknown}`
  )
  return { toUpdate, alreadyR2, externalKept, unknown }
}

async function main() {
  if (!R2_BUCKET || !R2_PUBLIC_URL) {
    console.error('R2_BUCKET / R2_PUBLIC_URL 환경변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`)
  console.log(`R2 bucket: ${R2_BUCKET}`)
  console.log(`R2 public: ${R2_PUBLIC_URL}\n`)

  await uploadFiles()
  await updateDbUrls()

  if (!APPLY) {
    console.log('\nDry-run 입니다. 실제 반영하려면 --apply 옵션을 붙여 다시 실행하세요.')
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
