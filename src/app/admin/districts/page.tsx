import { requireAdminSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import AdminDistrictsPage from '@/components/admin/AdminDistrictsPage'

export default async function AdminDistrictsListPage() {
  const session = await requireAdminSession()

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
      user={session.user}
      initialDistricts={districtsWithCount}
    />
  )
}