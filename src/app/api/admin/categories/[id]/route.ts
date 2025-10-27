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

// 카테고리 상세 조회
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        ...category,
        adCount: category._count.ads
      }
    })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// 카테고리 수정
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
    const { name, description } = body

    // 필수 필드 검증
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '카테고리 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 기존 카테고리 존재 확인
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // 이름 중복 확인 (본인 제외)
    if (name.trim() !== existingCategory.name) {
      const duplicateName = await prisma.category.findUnique({
        where: { name: name.trim() }
      })

      if (duplicateName) {
        return NextResponse.json(
          { error: '이미 존재하는 카테고리 이름입니다.' },
          { status: 400 }
        )
      }
    }

    // 카테고리 수정
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    return NextResponse.json({
      message: '카테고리가 성공적으로 수정되었습니다.',
      data: {
        ...updatedCategory,
        adCount: updatedCategory._count.ads
      }
    })

  } catch (error) {
    console.error('Error updating category:', error)
    
    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '이미 존재하는 카테고리 이름입니다.' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: '카테고리 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 카테고리 삭제
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

    // 카테고리 존재 확인
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ads: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // 연결된 광고가 있는지 확인
    if (category._count.ads > 0) {
      return NextResponse.json(
        { error: `이 카테고리에 ${category._count.ads}개의 광고가 연결되어 있습니다. 먼저 광고를 다른 카테고리로 변경해주세요.` },
        { status: 400 }
      )
    }

    // 카테고리 삭제
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '카테고리가 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: '카테고리 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}