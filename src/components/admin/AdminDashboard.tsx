'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalAds: number
  activeAds: number
  totalCategories: number
  totalDistricts: number
}

interface AdminDashboardProps {
  user: { email?: string | null }
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalAds: 0,
    activeAds: 0,
    totalCategories: 0,
    totalDistricts: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [adsRes, categoriesRes, districtsRes] = await Promise.all([
        fetch('/api/ads'),
        fetch('/api/categories'),
        fetch('/api/districts')
      ])

      const [adsData, categoriesData, districtsData] = await Promise.all([
        adsRes.json(),
        categoriesRes.json(),
        districtsRes.json()
      ])

      const ads = adsData.data || []
      const activeAds = ads.filter((ad: any) => ad.isActive).length

      setStats({
        totalAds: ads.length,
        activeAds,
        totalCategories: categoriesData.data?.length || 0,
        totalDistricts: districtsData.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const menuItems = [
    {
      title: '광고 관리',
      description: '광고 생성, 수정, 삭제 및 상태 관리',
      href: '/admin/ads',
      icon: '📢',
      stats: `${stats.activeAds}/${stats.totalAds} 활성`
    },
    {
      title: '카테고리 관리',
      description: '광고 카테고리 추가, 수정, 삭제',
      href: '/admin/categories',
      icon: '📋',
      stats: `${stats.totalCategories}개`
    },
    {
      title: '지역 관리',
      description: '광고 지역 정보 관리',
      href: '/admin/districts',
      icon: '🗺️',
      stats: `${stats.totalDistricts}개`
    },
    {
      title: '새 광고',
      description: '새로운 광고 등록',
      href: '/admin/ads/create',
      icon: '➕',
      stats: '등록'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Motnt Ad Place
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                관리자
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                안녕하세요, {user.email}
              </span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                사이트 보기
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 광고</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : stats.totalAds}
                </p>
              </div>
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 광고</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '-' : stats.activeAds}
                </p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">카테고리</p>
                <p className="text-2xl font-bold" style={{ color: '#B8312F' }}>
                  {loading ? '-' : stats.totalCategories}
                </p>
              </div>
              <div style={{ color: '#B8312F' }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">지역</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '-' : stats.totalDistricts}
                </p>
              </div>
              <div className="text-orange-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{item.icon}</div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {item.stats}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* 최근 활동 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                빠른 작업
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/admin/ads/create')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">새 광고 등록</span>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/admin/ads')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">광고 목록</span>
                  </div>
                </button>
                
                <button
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors"
                  style={{
                    '--hover-border': '#B8312F',
                    '--hover-bg': '#fef2f2'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#B8312F';
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">사이트 미리보기</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}