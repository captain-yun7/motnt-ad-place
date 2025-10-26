import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminDistrictsPage from '@/components/admin/AdminDistrictsPage'

export default async function AdminDistrictsListPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 지역 목록 직접 조회
  const districts = await prisma.district.findMany({
    include: {
      _count: {
        select: { ads: true }
      }
    },
    orderBy: [
      { city: 'asc' },
      { name: 'asc' }
    ]
  })

  // adCount 필드 추가
  const districtsWithCount = districts.map(district => ({
    ...district,
    adCount: district._count.ads
  }))

  return (
    <AdminDistrictsPage 
      user={user}
      initialDistricts={districtsWithCount}
    />
  )
}