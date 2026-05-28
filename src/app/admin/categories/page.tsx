import { requireAdminSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import AdminCategoriesPage from '@/components/admin/AdminCategoriesPage'

export default async function AdminCategoriesListPage() {
  const session = await requireAdminSession()

  // 카테고리 목록 직접 조회
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { ads: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // adCount 필드 추가
  const categoriesWithCount = categories.map(category => ({
    ...category,
    adCount: category._count.ads
  }))

  return (
    <AdminCategoriesPage
      user={session.user}
      initialCategories={categoriesWithCount}
    />
  )
}