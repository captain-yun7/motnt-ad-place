import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminCategoriesPage from '@/components/admin/AdminCategoriesPage'

export default async function AdminCategoriesListPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

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
      user={user}
      initialCategories={categoriesWithCount}
    />
  )
}