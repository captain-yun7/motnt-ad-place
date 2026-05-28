import { requireAdminSession } from '@/lib/auth/session'
import AdCreateForm from '@/components/admin/AdCreateForm'
import { prisma } from '@/lib/prisma'

export default async function AdminAdCreatePage() {
  const session = await requireAdminSession()

  // 카테고리와 지역 정보 직접 조회
  const [categories, districts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.district.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <AdCreateForm
      user={session.user}
      categories={categories}
      districts={districts}
    />
  )
}