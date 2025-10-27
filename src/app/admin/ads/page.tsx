import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminAdsPage from '@/components/admin/AdminAdsPage'
import { prisma } from '@/lib/prisma'
import { AdResponse } from '@/types/ad'

export default async function AdminAdsListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 광고 목록, 카테고리, 지역 정보 직접 조회
  const [ads, categories, districts] = await Promise.all([
    prisma.ad.findMany({
      where: { isActive: true },
      include: {
        category: true,
        district: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.district.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  // AdResponse 타입으로 변환
  const adResponses: AdResponse[] = ads.map(ad => ({
    id: ad.id,
    title: ad.title,
    slug: ad.slug,
    description: ad.description,
    location: ad.location as any,
    specs: ad.specs as any,
    pricing: ad.pricing as any,
    availability: ad.availability as any,
    metadata: ad.metadata as any,
    status: ad.status,
    featured: ad.featured,
    tags: ad.tags,
    viewCount: ad.viewCount,
    favoriteCount: ad.favoriteCount,
    inquiryCount: ad.inquiryCount,
    verified: ad.verified,
    verifiedAt: ad.verifiedAt?.toISOString() || null,
    category: {
      id: ad.category.id,
      name: ad.category.name,
    },
    district: {
      id: ad.district.id,
      name: ad.district.name,
      city: ad.district.city,
    },
    images: ad.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
    })),
    createdAt: ad.createdAt.toISOString(),
    updatedAt: ad.updatedAt.toISOString(),
  }))

  return (
    <AdminAdsPage
      user={user}
      initialAds={adResponses}
      categories={categories}
      districts={districts}
    />
  )
}