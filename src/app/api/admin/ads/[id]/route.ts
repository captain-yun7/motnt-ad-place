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

// 광고 삭제
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

    // 관련 이미지 먼저 삭제
    await prisma.adImage.deleteMany({
      where: { adId: id }
    })

    // 광고 삭제
    const deletedAd = await prisma.ad.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Ad deleted successfully',
      data: deletedAd 
    })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    )
  }
}

// 광고 상태 업데이트 (활성/비활성)
export async function PATCH(
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
    const { isActive } = body

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: { 
        isActive: isActive,
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
      message: 'Ad status updated successfully',
      data: updatedAd 
    })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    )
  }
}

// 관리자용 광고 상세 조회
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

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        category: true,
        district: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: ad })
  } catch (error) {
    console.error('Error fetching ad:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    )
  }
}