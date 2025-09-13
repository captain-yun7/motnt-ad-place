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
}

interface District {
  id: string
  name: string
  city: string
  adCount: number
}

interface AdCreateFormProps {
  user: User
  categories: Category[]
  districts: District[]
}

interface AdFormData {
  title: string
  slug: string
  description: string
  categoryId: string
  districtId: string
  location: {
    address: string
    landmark: string
    coordinates: [number, number] | null
  }
  specs: {
    width: string
    height: string
    resolution: string
    brightness: string
    material: string
    type: string
  }
  pricing: {
    monthly: number
    setup: number
    design: number
    deposit: number
    currency: string
    minimumPeriod: number
  }
  metadata: {
    traffic: string
    visibility: string
    restrictions: string[]
    operatingHours: string
    nearbyBusinesses: string[]
  }
  isActive: boolean
}

export default function AdCreateForm({ user, categories, districts }: AdCreateFormProps) {
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    slug: '',
    description: '',
    categoryId: '',
    districtId: '',
    location: {
      address: '',
      landmark: '',
      coordinates: null
    },
    specs: {
      width: '',
      height: '',
      resolution: '',
      brightness: '',
      material: '',
      type: ''
    },
    pricing: {
      monthly: 0,
      setup: 0,
      design: 0,
      deposit: 0,
      currency: 'KRW',
      minimumPeriod: 1
    },
    metadata: {
      traffic: '',
      visibility: '',
      restrictions: [],
      operatingHours: '24시간',
      nearbyBusinesses: []
    },
    isActive: true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  // 제목에서 slug 자동 생성
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof AdFormData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayInputChange = (field: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item)
    handleInputChange(field, arrayValue)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 폼 데이터 검증
      if (!formData.title.trim()) {
        throw new Error('광고 제목을 입력해주세요.')
      }
      if (!formData.categoryId) {
        throw new Error('카테고리를 선택해주세요.')
      }
      if (!formData.districtId) {
        throw new Error('지역을 선택해주세요.')
      }
      if (!formData.location.address.trim()) {
        throw new Error('주소를 입력해주세요.')
      }
      if (formData.pricing.monthly <= 0) {
        throw new Error('월 광고료를 입력해주세요.')
      }

      // 광고 생성 API 호출
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '광고 생성 중 오류가 발생했습니다.')
      }

      const result = await response.json()
      
      // 이미지 업로드 처리
      if (images.length > 0) {
        try {
          const imageFormData = new FormData()
          images.forEach((image) => {
            imageFormData.append('images', image)
          })
          imageFormData.append('adId', result.data.id)

          const imageResponse = await fetch('/api/admin/images', {
            method: 'POST',
            body: imageFormData
          })

          if (!imageResponse.ok) {
            const imageError = await imageResponse.json()
            console.error('Image upload failed:', imageError)
            // 이미지 업로드 실패해도 광고는 생성되었으므로 경고만 표시
            alert(`광고는 생성되었지만 이미지 업로드 중 오류가 발생했습니다: ${imageError.error}`)
          } else {
            const imageResult = await imageResponse.json()
            console.log('Images uploaded successfully:', imageResult)
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError)
          alert('광고는 생성되었지만 이미지 업로드 중 오류가 발생했습니다.')
        }
      }

      alert('광고가 성공적으로 생성되었습니다!')
      router.push('/admin/ads')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/ads')}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>광고 목록</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">새 광고 등록</h1>
                <p className="text-sm text-gray-600">새로운 광고를 등록합니다</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  광고 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 강남역 LED 전광판"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL 슬러그
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="자동 생성됩니다"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /ad/{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">선택해주세요</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  지역 *
                </label>
                <select
                  value={formData.districtId}
                  onChange={(e) => handleInputChange('districtId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">선택해주세요</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="광고에 대한 자세한 설명을 입력하세요"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">광고 활성화</span>
                </label>
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">위치 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="서울시 강남구 테헤란로 123"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  랜드마크
                </label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => handleInputChange('location.landmark', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="강남역, 코엑스 등"
                />
              </div>
            </div>
          </div>

          {/* 광고 스펙 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">광고 스펙</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  너비
                </label>
                <input
                  type="text"
                  value={formData.specs.width}
                  onChange={(e) => handleInputChange('specs.width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 5m"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  높이
                </label>
                <input
                  type="text"
                  value={formData.specs.height}
                  onChange={(e) => handleInputChange('specs.height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 3m"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  해상도
                </label>
                <input
                  type="text"
                  value={formData.specs.resolution}
                  onChange={(e) => handleInputChange('specs.resolution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 1920x1080"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  밝기
                </label>
                <input
                  type="text"
                  value={formData.specs.brightness}
                  onChange={(e) => handleInputChange('specs.brightness', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 5000 nits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  재질
                </label>
                <input
                  type="text"
                  value={formData.specs.material}
                  onChange={(e) => handleInputChange('specs.material', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: LED, 배너천"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  타입
                </label>
                <input
                  type="text"
                  value={formData.specs.type}
                  onChange={(e) => handleInputChange('specs.type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 실외 전광판"
                />
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 광고료 (원) *
                </label>
                <input
                  type="number"
                  value={formData.pricing.monthly}
                  onChange={(e) => handleInputChange('pricing.monthly', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보증금 (원)
                </label>
                <input
                  type="number"
                  value={formData.pricing.deposit}
                  onChange={(e) => handleInputChange('pricing.deposit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="200000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설치비 (원)
                </label>
                <input
                  type="number"
                  value={formData.pricing.setup}
                  onChange={(e) => handleInputChange('pricing.setup', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  디자인비 (원)
                </label>
                <input
                  type="number"
                  value={formData.pricing.design}
                  onChange={(e) => handleInputChange('pricing.design', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 계약 기간 (개월)
                </label>
                <input
                  type="number"
                  value={formData.pricing.minimumPeriod}
                  onChange={(e) => handleInputChange('pricing.minimumPeriod', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* 메타데이터 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유동인구
                </label>
                <input
                  type="text"
                  value={formData.metadata.traffic}
                  onChange={(e) => handleInputChange('metadata.traffic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 일평균 5만명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가시성
                </label>
                <select
                  value={formData.metadata.visibility}
                  onChange={(e) => handleInputChange('metadata.visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="매우 좋음">매우 좋음</option>
                  <option value="좋음">좋음</option>
                  <option value="보통">보통</option>
                  <option value="제한적">제한적</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  운영 시간
                </label>
                <input
                  type="text"
                  value={formData.metadata.operatingHours}
                  onChange={(e) => handleInputChange('metadata.operatingHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="24시간"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제약 사항
                </label>
                <input
                  type="text"
                  value={formData.metadata.restrictions.join(', ')}
                  onChange={(e) => handleArrayInputChange('metadata.restrictions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="구청 허가 필요, 콘텐츠 심의 (쉼표로 구분)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주변 상권
                </label>
                <input
                  type="text"
                  value={formData.metadata.nearbyBusinesses.join(', ')}
                  onChange={(e) => handleArrayInputChange('metadata.nearbyBusinesses', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="강남역, 코엑스, 현대백화점 (쉼표로 구분)"
                />
              </div>
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">이미지</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                광고 이미지
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF 파일을 업로드할 수 있습니다. (다중 선택 가능)
              </p>
              {images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">선택된 파일: {images.length}개</p>
                  <ul className="text-xs text-gray-500">
                    {images.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/ads')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '광고 등록'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}