'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  description: string | null
  adCount: number
  createdAt: Date
  updatedAt: Date
}

interface AdminCategoriesPageProps {
  user: User
  initialCategories: Category[]
}

interface CategoryFormData {
  name: string
  description: string
}

export default function AdminCategoriesPage({ user, initialCategories }: AdminCategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
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
    setFormData({ name: '', description: '' })
    setFormError(null)
    setShowCreateForm(false)
    setEditingCategory(null)
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 카테고리 생성
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    try {
      if (!formData.name.trim()) {
        setFormError('카테고리 이름을 입력해주세요.')
        return
      }

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        setFormError(errorData.error || '카테고리 생성 중 오류가 발생했습니다.')
        return
      }

      const result = await response.json()
      setCategories([...categories, result.data])
      resetForm()
      alert('카테고리가 성공적으로 생성되었습니다!')

    } catch (error) {
      setFormError('카테고리 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 수정
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    setLoading(true)
    setFormError(null)

    try {
      if (!formData.name.trim()) {
        setFormError('카테고리 이름을 입력해주세요.')
        return
      }

      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        setFormError(errorData.error || '카테고리 수정 중 오류가 발생했습니다.')
        return
      }

      const result = await response.json()
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? result.data : cat
      ))
      resetForm()
      alert('카테고리가 성공적으로 수정되었습니다!')

    } catch (error) {
      setFormError('카테고리 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 삭제
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== category.id))
        alert('카테고리가 성공적으로 삭제되었습니다.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '카테고리 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('카테고리 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 수정 폼 열기
  const openEditForm = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowCreateForm(true)
  }

  // 필터링된 카테고리 목록
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
                <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
                <p className="text-sm text-gray-600">총 {filteredCategories.length}개의 카테고리</p>
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
        {/* 액션 버튼 및 검색 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>새 카테고리</span>
            </button>
          </div>
          
          <div className="w-64">
            <input
              type="text"
              placeholder="카테고리 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 생성/수정 폼 모달 */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? '카테고리 수정' : '새 카테고리 생성'}
              </h2>
              
              <form onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: LED 전광판"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="카테고리에 대한 설명을 입력하세요"
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
                    {loading ? '처리 중...' : (editingCategory ? '수정' : '생성')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 카테고리 목록 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
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
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {category.adCount}개
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditForm(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      disabled={loading || category.adCount > 0}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={category.adCount > 0 ? '연결된 광고가 있어 삭제할 수 없습니다' : ''}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">카테고리가 없습니다</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm ? '검색 조건에 맞는 카테고리가 없습니다.' : '새로운 카테고리를 생성해보세요.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  새 카테고리 생성
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}