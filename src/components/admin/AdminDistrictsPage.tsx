'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface District {
  id: string
  name: string
  city: string
  adCount: number
  createdAt: Date
  updatedAt: Date
}

interface AdminDistrictsPageProps {
  user: User
  initialDistricts: District[]
}

interface DistrictFormData {
  name: string
  city: string
}

export default function AdminDistrictsPage({ user, initialDistricts }: AdminDistrictsPageProps) {
  const [districts, setDistricts] = useState<District[]>(initialDistricts)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [formData, setFormData] = useState<DistrictFormData>({
    name: '',
    city: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const resetForm = () => {
    setFormData({ name: '', city: '' })
    setFormError(null)
    setShowCreateForm(false)
    setEditingDistrict(null)
  }

  const handleInputChange = (field: keyof DistrictFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 지역 생성
  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    try {
      if (!formData.name.trim()) {
        setFormError('지역 이름을 입력해주세요.')
        return
      }

      if (!formData.city.trim()) {
        setFormError('도시 이름을 입력해주세요.')
        return
      }

      const response = await fetch('/api/admin/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        setFormError(errorData.error || '지역 생성 중 오류가 발생했습니다.')
        return
      }

      const result = await response.json()
      setDistricts([...districts, result.data])
      resetForm()
      alert('지역이 성공적으로 생성되었습니다!')

    } catch (error) {
      setFormError('지역 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 지역 수정
  const handleEditDistrict = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDistrict) return

    setLoading(true)
    setFormError(null)

    try {
      if (!formData.name.trim()) {
        setFormError('지역 이름을 입력해주세요.')
        return
      }

      if (!formData.city.trim()) {
        setFormError('도시 이름을 입력해주세요.')
        return
      }

      const response = await fetch(`/api/admin/districts/${editingDistrict.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        setFormError(errorData.error || '지역 수정 중 오류가 발생했습니다.')
        return
      }

      const result = await response.json()
      setDistricts(districts.map(dist => 
        dist.id === editingDistrict.id ? result.data : dist
      ))
      resetForm()
      alert('지역이 성공적으로 수정되었습니다!')

    } catch (error) {
      setFormError('지역 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 지역 삭제
  const handleDeleteDistrict = async (district: District) => {
    if (!confirm(`'${district.name}' 지역을 삭제하시겠습니까?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/districts/${district.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDistricts(districts.filter(dist => dist.id !== district.id))
        alert('지역이 성공적으로 삭제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '지역 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('지역 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 수정 폼 열기
  const openEditForm = (district: District) => {
    setEditingDistrict(district)
    setFormData({
      name: district.name,
      city: district.city
    })
    setShowCreateForm(true)
  }

  // 고유한 도시 목록
  const uniqueCities = Array.from(new Set(districts.map(d => d.city))).sort()

  // 필터링된 지역 목록
  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = !cityFilter || district.city === cityFilter
    
    return matchesSearch && matchesCity
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
                <h1 className="text-2xl font-bold text-gray-900">지역 관리</h1>
                <p className="text-sm text-gray-600">총 {filteredDistricts.length}개의 지역</p>
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
        {/* 액션 버튼 및 필터 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>새 지역</span>
            </button>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">모든 도시</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            
            <div className="w-64">
              <input
                type="text"
                placeholder="지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 생성/수정 폼 모달 */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingDistrict ? '지역 수정' : '새 지역 생성'}
              </h2>
              
              <form onSubmit={editingDistrict ? handleEditDistrict : handleCreateDistrict}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도시 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 서울시"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    지역 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 강남구"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '처리 중...' : (editingDistrict ? '수정' : '생성')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 지역 목록 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  도시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연결된 광고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDistricts.map((district) => (
                <tr key={district.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {district.city}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {district.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {district.adCount}개
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(district.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditForm(district)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteDistrict(district)}
                      disabled={loading || district.adCount > 0}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={district.adCount > 0 ? '연결된 광고가 있어 삭제할 수 없습니다' : ''}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDistricts.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">지역이 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || cityFilter ? '검색 조건에 맞는 지역이 없습니다.' : '새로운 지역을 생성해보세요.'}
              </p>
              {!searchTerm && !cityFilter && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  새 지역 생성
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}