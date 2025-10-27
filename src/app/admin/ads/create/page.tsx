import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdCreateForm from '@/components/admin/AdCreateForm'
import { prisma } from '@/lib/prisma'

export default async function AdminAdCreatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

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
      user={user}
      categories={categories}
      districts={districts}
    />
  )
}