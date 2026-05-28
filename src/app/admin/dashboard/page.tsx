import { requireAdminSession } from '@/lib/auth/session'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminDashboardPage() {
  const session = await requireAdminSession()
  return <AdminDashboard user={session.user} />
}