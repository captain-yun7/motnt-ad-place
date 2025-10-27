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

// 지역 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    if (!district) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        ...district,
        adCount: district._count.ads
      }
    })

  } catch (error) {
    console.error('Error fetching district:', error)
    return NextResponse.json(
      { error: 'Failed to fetch district' },
      { status: 500 }
    )
  }
}

// 지역 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
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

    // 기존 지역 존재 확인
    const existingDistrict = await prisma.district.findUnique({
      where: { id }
    })

    if (!existingDistrict) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      )
    }

    // 이름 중복 확인 (본인 제외, 같은 도시 내에서)
    if (name.trim() !== existingDistrict.name || city.trim() !== existingDistrict.city) {
      const duplicateName = await prisma.district.findFirst({
        where: {
          name: name.trim(),
          city: city.trim(),
          id: { not: id }
        }
      })

      if (duplicateName) {
        return NextResponse.json(
          { error: '해당 도시에 이미 존재하는 지역 이름입니다.' },
          { status: 400 }
        )
      }
    }

    // 지역 수정
    const updatedDistrict = await prisma.district.update({
      where: { id },
      data: {
        name: name.trim(),
        city: city.trim(),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    return NextResponse.json({
      message: '지역이 성공적으로 수정되었습니다.',
      data: {
        ...updatedDistrict,
        adCount: updatedDistrict._count.ads
      }
    })

  } catch (error) {
    console.error('Error updating district:', error)
    
    return NextResponse.json(
      { error: '지역 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 지역 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 지역 존재 확인
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    if (!district) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      )
    }

    // 연결된 광고가 있는지 확인
    if (district._count.ads > 0) {
      return NextResponse.json(
        { error: `이 지역에 ${district._count.ads}개의 광고가 연결되어 있습니다. 먼저 광고를 다른 지역으로 변경해주세요.` },
        { status: 400 }
      )
    }

    // 지역 삭제
    await prisma.district.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '지역이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting district:', error)
    return NextResponse.json(
      { error: '지역 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}