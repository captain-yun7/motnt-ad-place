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

// 카테고리 목록 조회 (관리자용)
export async function GET() {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { ads: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // adCount 필드 추가
    const categoriesWithCount = categories.map(category => ({
      ...category,
      adCount: category._count.ads
    }))

    return NextResponse.json({ data: categoriesWithCount })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// 카테고리 생성
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
    const { name, description } = body

    // 필수 필드 검증
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '카테고리 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 중복 이름 확인
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: '이미 존재하는 카테고리 이름입니다.' },
        { status: 400 }
      )
    }

    // 카테고리 생성
    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
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
      message: '카테고리가 성공적으로 생성되었습니다.',
      data: {
        ...newCategory,
        adCount: newCategory._count.ads
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    
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
      { error: '카테고리 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}