import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdEditForm from '@/components/admin/AdEditForm'

export default async function AdminAdEditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = createClient()
  const { id } = await params
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 광고 상세 정보 직접 조회
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      category: true,
      district: true,
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!ad) {
    notFound()
  }

  // 카테고리와 지역 정보도 함께 조회
  const [categories, districts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.district.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  // adCount 추가를 위한 카테고리 데이터 처리
  const categoriesWithCount = await Promise.all(
    categories.map(async (category: any) => ({
      ...category,
      adCount: await prisma.ad.count({
        where: { categoryId: category.id }
      })
    }))
  )

  // adCount 추가를 위한 지역 데이터 처리
  const districtsWithCount = await Promise.all(
    districts.map(async (district: any) => ({
      ...district,
      adCount: await prisma.ad.count({
        where: { districtId: district.id }
      })
    }))
  )

  return (
    <AdEditForm 
      user={user}
      ad={ad}
      categories={categoriesWithCount}
      districts={districtsWithCount}
    />
  )
}