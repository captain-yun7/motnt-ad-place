import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// 관리자 인증 확인
async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

// 광고 생성
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      categoryId,
      districtId,
      // Phase 1 필드
      status,
      featured,
      tags,
      verified,
      location,
      specs,
      pricing,
      metadata,
      isActive
    } = body

    // 필수 필드 검증
    if (!title?.trim()) {
      return NextResponse.json(
        { error: '광고 제목을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: '카테고리를 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!districtId) {
      return NextResponse.json(
        { error: '지역을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!location?.address?.trim()) {
      return NextResponse.json(
        { error: '주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!pricing?.monthly || pricing.monthly <= 0) {
      return NextResponse.json(
        { error: '월 광고료를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 슬러그 중복 확인
    if (slug) {
      const existingAd = await prisma.ad.findUnique({
        where: { slug }
      })

      if (existingAd) {
        return NextResponse.json(
          { error: '이미 사용 중인 슬러그입니다.' },
          { status: 400 }
        )
      }
    }

    // 카테고리와 지역 존재 확인
    const [category, district] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.district.findUnique({ where: { id: districtId } })
    ])

    if (!category) {
      return NextResponse.json(
        { error: '존재하지 않는 카테고리입니다.' },
        { status: 400 }
      )
    }

    if (!district) {
      return NextResponse.json(
        { error: '존재하지 않는 지역입니다.' },
        { status: 400 }
      )
    }

    // 광고 생성
    const newAd = await prisma.ad.create({
      data: {
        title: title.trim(),
        slug: slug || title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-'),
        description: description?.trim() || '',
        categoryId,
        districtId,
        // Phase 1 필드
        status: status || 'ACTIVE',
        featured: featured || false,
        tags: tags || [],
        verified: verified || false,
        viewCount: 0,
        favoriteCount: 0,
        inquiryCount: 0,
        location: {
          address: location.address.trim(),
          landmark: location.landmark?.trim() || '',
          coordinates: location.coordinates || null
        },
        specs: {
          width: specs?.width?.trim() || '',
          height: specs?.height?.trim() || '',
          resolution: specs?.resolution?.trim() || '',
          brightness: specs?.brightness?.trim() || '',
          material: specs?.material?.trim() || '',
          type: specs?.type?.trim() || ''
        },
        pricing: {
          monthly: pricing.monthly,
          weekly: pricing.weekly || null,
          daily: pricing.daily || null,
          setup: pricing.setup || 0,
          design: pricing.design || 0,
          deposit: pricing.deposit || 0,
          currency: pricing.currency || 'KRW',
          minimumPeriod: pricing.minimumPeriod || 1,
          discounts: pricing.discounts || {}
        },
        metadata: {
          traffic: metadata?.traffic?.trim() || '',
          visibility: metadata?.visibility || '',
          restrictions: metadata?.restrictions || [],
          operatingHours: metadata?.operatingHours || '24시간',
          nearbyBusinesses: metadata?.nearbyBusinesses || []
        },
        isActive: isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        category: true,
        district: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: '광고가 성공적으로 생성되었습니다.',
      data: newAd
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating ad:', error)
    
    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '이미 존재하는 슬러그입니다.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: '잘못된 카테고리 또는 지역 정보입니다.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: '광고 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 관리자용 광고 목록 조회
export async function GET() {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ads = await prisma.ad.findMany({
      include: {
        category: true,
        district: true,
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data: ads })

  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}