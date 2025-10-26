import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdCreateForm from '@/components/admin/AdCreateForm'

export default async function AdminAdCreatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 카테고리와 지역 정보 조회
  const [categoriesRes, districtsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/districts`, {
      cache: 'no-store'
    })
  ])

  const categoriesData = await categoriesRes.json()
  const districtsData = await districtsRes.json()

  return (
    <AdCreateForm 
      user={user}
      categories={categoriesData.data || []}
      districts={districtsData.data || []}
    />
  )
}