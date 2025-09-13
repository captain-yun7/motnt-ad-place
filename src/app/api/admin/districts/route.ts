import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// 관리자 인증 확인
async function checkAdminAuth() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// 지역 목록 조회 (관리자용)
export async function GET() {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const districts = await prisma.district.findMany({
      include: {
        _count: {
          select: { ads: true }
        }
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ]
    })

    // adCount 필드 추가
    const districtsWithCount = districts.map(district => ({
      ...district,
      adCount: district._count.ads
    }))

    return NextResponse.json({ data: districtsWithCount })

  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    )
  }
}

// 지역 생성
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
    const { name, city } = body

    // 필수 필드 검증
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '지역 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: '도시 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 이름 확인 (같은 도시 내에서)
    const existingDistrict = await prisma.district.findFirst({
      where: {
        name: name.trim(),
        city: city.trim()
      }
    })

    if (existingDistrict) {
      return NextResponse.json(
        { error: '해당 도시에 이미 존재하는 지역 이름입니다.' },
        { status: 400 }
      )
    }

    // 지역 생성
    const newDistrict = await prisma.district.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    return NextResponse.json({
      message: '지역이 성공적으로 생성되었습니다.',
      data: {
        ...newDistrict,
        adCount: newDistrict._count.ads
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating district:', error)
    
    return NextResponse.json(
      { error: '지역 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}