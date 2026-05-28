import { S3Client } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

export const R2_BUCKET = process.env.R2_BUCKET ?? ''
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

export const r2 = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
})

export function r2PublicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`
}

export function r2KeyFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL) return null
  if (!url.startsWith(R2_PUBLIC_URL + '/')) return null
  return url.slice(R2_PUBLIC_URL.length + 1)
}
