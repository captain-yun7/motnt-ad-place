import { prisma } from '@/lib/prisma'

/**
 * 이메일로 관리자 여부 확인
 */
export async function isAdmin(email: string): Promise<boolean> {
  if (!email) return false

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!admin
  } catch (error) {
    console.error('Error checking admin status:', error)
    // DB 연결 실패 시 임시로 true 반환 (개발 중)
    console.warn('Allowing admin access due to DB connection error')
    return true
  }
}
