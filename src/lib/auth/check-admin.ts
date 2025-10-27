import { prisma } from '@/lib/prisma'

/**
 * 이메일로 관리자 여부 확인
 */
export async function isAdmin(email: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })
    return !!admin
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
