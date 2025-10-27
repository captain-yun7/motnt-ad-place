'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import DaumPostcode from 'react-daum-postcode'

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
  // Phase 1 필드
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'EXPIRED'
  featured: boolean
  tags: string[]
  verified: boolean
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
    weekly?: number
    daily?: number
    setup: number
    design: number
    deposit: number
    currency: string
    minimumPeriod: number
    discounts?: {
      [key: string]: number
    }
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
    // Phase 1 필드 초기값
    status: 'ACTIVE',
    featured: false,
    tags: [],
    verified: false,
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
      weekly: 0,
      daily: 0,
      setup: 0,
      design: 0,
      deposit: 0,
      currency: 'KRW',
      minimumPeriod: 1,
      discounts: {}
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
  const [showTemplates, setShowTemplates] = useState(true)
  const [showPostcode, setShowPostcode] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Daum Postcode 주소 선택 핸들러
  const handleAddressComplete = (data: any) => {
    const fullAddress = data.roadAddress || data.jibunAddress

    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: fullAddress,
        coordinates: [0, 0] // 좌표는 Naver Map API로 별도 변환 가능
      }
    }))

    setShowPostcode(false)
  }

  // 템플릿 데이터
  const templates = [
    {
      id: 'led-gangnam',
      name: '🔷 LED 전광판 (강남)',
      icon: '📺',
      data: {
        title: '강남역 LED 전광판 A구역',
        description: '강남역 2번 출구 정면, 일 평균 유동인구 5만명의 프리미엄 광고 위치입니다.',
        status: 'ACTIVE' as const,
        featured: true,
        tags: ['강남', '역세권', 'LED', '대형', '24시간'],
        verified: true,
        location: {
          address: '서울시 강남구 강남대로 지하 396 (역삼동)',
          landmark: '강남역 2번출구',
          coordinates: [127.027926, 37.497954]
        },
        specs: {
          width: '5m',
          height: '3m',
          resolution: '1920x1080',
          brightness: '5000 nits',
          material: 'LED',
          type: '실외 전광판'
        },
        pricing: {
          monthly: 3000000,
          weekly: 800000,
          daily: 150000,
          setup: 500000,
          design: 300000,
          deposit: 1000000,
          currency: 'KRW',
          minimumPeriod: 3,
          discounts: {
            '3months': 5,
            '6months': 10,
            '12months': 20
          }
        },
        metadata: {
          traffic: '일평균 5만명',
          visibility: '매우 좋음',
          restrictions: ['구청 허가 필요', '콘텐츠 심의'],
          operatingHours: '24시간',
          nearbyBusinesses: ['강남역', '신논현역', '현대백화점']
        }
      }
    },
    {
      id: 'banner-hongdae',
      name: '🎨 배너 간판 (홍대)',
      icon: '🎪',
      data: {
        title: '홍대입구 메인거리 배너 광고',
        description: '홍대 메인 상권 중심, 젊은 층 타겟팅에 최적화된 광고 위치입니다.',
        status: 'ACTIVE' as const,
        featured: false,
        tags: ['홍대', '젊은층', '배너', '상권', '주말'],
        verified: true,
        location: {
          address: '서울시 마포구 양화로 홍대입구역 인근',
          landmark: '홍대입구역 9번출구',
          coordinates: [126.92491, 37.556628]
        },
        specs: {
          width: '3m',
          height: '2m',
          resolution: '',
          brightness: '',
          material: '배너천',
          type: '실외 배너'
        },
        pricing: {
          monthly: 1500000,
          weekly: 400000,
          daily: 80000,
          setup: 200000,
          design: 150000,
          deposit: 500000,
          currency: 'KRW',
          minimumPeriod: 1,
          discounts: {
            '3months': 5,
            '6months': 8
          }
        },
        metadata: {
          traffic: '주말 일평균 3만명',
          visibility: '좋음',
          restrictions: ['날씨 영향'],
          operatingHours: '24시간',
          nearbyBusinesses: ['홍대입구역', '상수역', '각종 카페/식당']
        }
      }
    },
    {
      id: 'bus-jamsil',
      name: '🚌 버스정류장 (잠실)',
      icon: '🚏',
      data: {
        title: '잠실역 버스정류장 광고판',
        description: '잠실역 1번출구 앞 버스정류장, 대기 시간 동안 높은 주목도를 보장합니다.',
        status: 'ACTIVE' as const,
        featured: false,
        tags: ['잠실', '버스정류장', '대기광고', '롯데월드'],
        verified: false,
        location: {
          address: '서울시 송파구 올림픽로 잠실역 1번출구',
          landmark: '잠실역 1번출구',
          coordinates: [127.100311, 37.513292]
        },
        specs: {
          width: '2m',
          height: '1.5m',
          resolution: '',
          brightness: '',
          material: '아크릴',
          type: '버스정류장 광고판'
        },
        pricing: {
          monthly: 800000,
          weekly: 220000,
          daily: 40000,
          setup: 100000,
          design: 80000,
          deposit: 300000,
          currency: 'KRW',
          minimumPeriod: 1,
          discounts: {
            '6months': 10,
            '12months': 15
          }
        },
        metadata: {
          traffic: '일평균 2만명',
          visibility: '보통',
          restrictions: ['광고물법 준수'],
          operatingHours: '24시간',
          nearbyBusinesses: ['잠실역', '롯데월드', '롯데백화점']
        }
      }
    }
  ]

  // 템플릿 적용 함수
  const applyTemplate = (template: typeof templates[0]) => {
    const categoryName = template.id.includes('led') ? 'LED 전광판' :
                         template.id.includes('banner') ? '간판/배너' : '버스/지하철'
    const category = categories.find(c => c.name === categoryName)

    const districtName = template.id.includes('gangnam') ? '강남구' :
                         template.id.includes('hongdae') ? '마포구' : '송파구'
    const district = districts.find(d => d.name === districtName)

    setFormData({
      ...template.data,
      categoryId: category?.id || '',
      districtId: district?.id || '',
      slug: '',
      isActive: true
    })

    setShowTemplates(false)
  }

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 템플릿 사이드바 */}
          {showTemplates && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">빠른 등록 템플릿</h3>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  템플릿을 선택하면 예시 데이터가 자동으로 채워집니다
                </p>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-amber-600 mb-1">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {template.data.title}
                          </div>
                          <div className="text-xs text-amber-600 font-medium mt-2">
                            {template.data.pricing.monthly.toLocaleString()}원/월
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(false)}
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                  >
                    템플릿 없이 직접 입력 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 폼 영역 */}
          <div className="flex-1">
            {!showTemplates && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="mb-4 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                템플릿 보기
              </button>
            )}
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

          {/* Phase 1 필드 - 상태 및 옵션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">상태 및 옵션</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  광고 상태
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="DRAFT">임시저장</option>
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="SOLD_OUT">계약완료</option>
                  <option value="EXPIRED">만료</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleArrayInputChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="예: 강남, 역세권, LED, 대형, 24시간"
                />
                <p className="text-xs text-gray-500 mt-1">
                  검색에 활용될 키워드를 입력하세요
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">추천 광고로 표시</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  메인 페이지 및 리스트에서 상단 노출됩니다
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => handleInputChange('verified', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">검증된 광고 (✓ 배지 표시)</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  신뢰할 수 있는 광고임을 표시합니다
                </p>
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">위치 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소 검색 *
                </label>

                <button
                  type="button"
                  onClick={() => setShowPostcode(true)}
                  className="w-full px-4 py-3 border-2 border-amber-500 text-amber-600 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  주소 검색하기
                </button>

                {/* Daum Postcode 팝업 */}
                {showPostcode && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
                        <button
                          type="button"
                          onClick={() => setShowPostcode(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <DaumPostcode
                          onComplete={handleAddressComplete}
                          autoClose={false}
                          style={{ height: '400px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 선택된 주소 표시 */}
                {formData.location.address && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-green-900 mb-1">
                          선택된 주소
                        </div>
                        <div className="text-sm text-green-700">
                          {formData.location.address}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 광고료 (원) *
                </label>
                <input
                  type="number"
                  value={formData.pricing.monthly}
                  onChange={(e) => handleInputChange('pricing.monthly', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="3000000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주 광고료 (원)
                </label>
                <input
                  type="number"
                  value={formData.pricing.weekly || ''}
                  onChange={(e) => handleInputChange('pricing.weekly', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="800000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  일 광고료 (원)
                </label>
                <input
                  type="number"
                  value={formData.pricing.daily || ''}
                  onChange={(e) => handleInputChange('pricing.daily', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="150000"
                  min="0"
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
                  placeholder="3"
                  min="1"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장기 계약 할인
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">3개월 할인 (%)</label>
                    <input
                      type="number"
                      placeholder="5"
                      min="0"
                      max="100"
                      onChange={(e) => {
                        const discounts = { ...formData.pricing.discounts }
                        if (e.target.value) {
                          discounts['3months'] = Number(e.target.value)
                        } else {
                          delete discounts['3months']
                        }
                        handleInputChange('pricing.discounts', discounts)
                      }}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">6개월 할인 (%)</label>
                    <input
                      type="number"
                      placeholder="10"
                      min="0"
                      max="100"
                      onChange={(e) => {
                        const discounts = { ...formData.pricing.discounts }
                        if (e.target.value) {
                          discounts['6months'] = Number(e.target.value)
                        } else {
                          delete discounts['6months']
                        }
                        handleInputChange('pricing.discounts', discounts)
                      }}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">12개월 할인 (%)</label>
                    <input
                      type="number"
                      placeholder="20"
                      min="0"
                      max="100"
                      onChange={(e) => {
                        const discounts = { ...formData.pricing.discounts }
                        if (e.target.value) {
                          discounts['12months'] = Number(e.target.value)
                        } else {
                          delete discounts['12months']
                        }
                        handleInputChange('pricing.discounts', discounts)
                      }}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
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
          </div>
        </div>
      </main>
    </div>
  )
}