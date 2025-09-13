'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { AdResponse } from '@/types/ad'

interface Category {
  id: string
  name: string
  description: string | null
  adCount: number
}

interface District {
  id: string
  name: string
  city: string
  adCount: number
}

interface AdminAdsPageProps {
  user: User
  initialAds: AdResponse[]
  categories: Category[]
  districts: District[]
}

export default function AdminAdsPage({ user, initialAds, categories, districts }: AdminAdsPageProps) {
  const [ads, setAds] = useState<AdResponse[]>(initialAds)
  const [loading, setLoading] = useState(false)
  const [selectedAds, setSelectedAds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  // 광고 삭제
  const handleDeleteAd = async (adId: string) => {
    if (!confirm('정말로 이 광고를 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAds(ads.filter(ad => ad.id !== adId))
        alert('광고가 성공적으로 삭제되었습니다.')
      } else {
        alert('광고 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('광고 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 광고 상태 토글
  const handleToggleStatus = async (adId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        setAds(ads.map(ad => 
          ad.id === adId ? { ...ad, isActive: !currentStatus } : ad
        ))
      } else {
        alert('광고 상태 변경 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('광고 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 선택된 광고들 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedAds.length === 0) {
      alert('삭제할 광고를 선택해주세요.')
      return
    }

    if (!confirm(`선택된 ${selectedAds.length}개의 광고를 삭제하시겠습니까?`)) return

    setLoading(true)
    try {
      const promises = selectedAds.map(adId => 
        fetch(`/api/admin/ads/${adId}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      setAds(ads.filter(ad => !selectedAds.includes(ad.id)))
      setSelectedAds([])
      alert(`${selectedAds.length}개의 광고가 성공적으로 삭제되었습니다.`)
    } catch (error) {
      alert('광고 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 광고 목록
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || ad.category.id === categoryFilter
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && ad.isActive) ||
                         (statusFilter === 'inactive' && !ad.isActive)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>대시보드</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">광고 관리</h1>
                <p className="text-sm text-gray-600">총 {filteredAds.length}개의 광고</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.email}
              </span>
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
        {/* 액션 버튼들 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/ads/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>새 광고 등록</span>
            </button>
            
            {selectedAds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                선택 삭제 ({selectedAds.length})
              </button>
            )}
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <input
                type="text"
                placeholder="광고명, 주소..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">작업</label>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('')
                  setStatusFilter('')
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 광고 목록 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAds.length === filteredAds.length && filteredAds.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAds(filteredAds.map(ad => ad.id))
                      } else {
                        setSelectedAds([])
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  광고 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAds.includes(ad.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAds([...selectedAds, ad.id])
                        } else {
                          setSelectedAds(selectedAds.filter(id => id !== ad.id))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-16">
                        {ad.images && ad.images.length > 0 ? (
                          <img
                            src={ad.images[0].url}
                            alt={ad.title}
                            className="h-12 w-16 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNiAyMEMyNiAxOC44OTU0IDI2Ljg5NTQgMTggMjggMThIMzZDMzcuMTA0NiAxOCAzOCAxOC44OTU0IDM4IDIwVjI4QzM4IDI5LjEwNDYgMzcuMTA0NiAzMCAzNiAzMEgyOEMyNi44OTU0IDMwIDI2IDI5LjEwNDYgMjYgMjhWMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0zMSAyM0MzMS41NTIzIDIzIDMyIDIzLjQ0NzcgMzIgMjRDMzIgMjQuNTUyMyAzMS41NTIzIDI1IDMxIDI1QzMwLjQ0NzcgMjUgMzAgMjQuNTUyMyAzMCAyNEMzMCAyMy40NDc3IDMwLjQ0NzcgMjMgMzEgMjNaIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPm5vIGltYWdlPC90ZXh0Pgo8L3N2Zz4K'
                            }}
                          />
                        ) : (
                          <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ad.location.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.district.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ad.pricing.monthly.toLocaleString()}원/월
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(ad.id, ad.isActive)}
                      disabled={loading}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } disabled:opacity-50`}
                    >
                      {ad.isActive ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/admin/ads/${ad.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => window.open(`/ad/${ad.id}`, '_blank')}
                      className="text-green-600 hover:text-green-900"
                    >
                      보기
                    </button>
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAds.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">광고가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || categoryFilter || statusFilter 
                  ? '검색 조건에 맞는 광고가 없습니다.' 
                  : '새로운 광고를 등록해보세요.'}
              </p>
              <button
                onClick={() => router.push('/admin/ads/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                새 광고 등록
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}