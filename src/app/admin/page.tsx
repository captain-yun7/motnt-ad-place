import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminPage() {
  // 쿠키 확인하여 인증 여부 체크
  const cookieStore = await cookies();
  const authCookies = cookieStore.getAll();

  // Supabase 인증 쿠키 확인 (sb-{project-ref}-auth-token 형식)
  const hasAuthCookie = authCookies.some(cookie =>
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  // 인증되어 있으면 대시보드로, 아니면 로그인 페이지로
  if (hasAuthCookie) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
