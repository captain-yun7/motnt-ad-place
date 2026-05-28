import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')
  return { user: session.user as { email?: string | null; name?: string | null } }
}
