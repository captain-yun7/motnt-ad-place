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

// 이미지 삭제
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

    // 이미지 정보 조회
    const image = await prisma.adImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json(
        { error: '이미지를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const supabase = await createClient()

    try {
      // URL에서 파일 경로 추출
      const url = new URL(image.url)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const adId = pathParts[pathParts.length - 2]
      const fullPath = `${adId}/${fileName}`

      // Supabase Storage에서 파일 삭제
      const { error: deleteError } = await supabase.storage
        .from('motnt-ad-place-bucket')
        .remove([fullPath])

      if (deleteError) {
        console.error('Supabase delete error:', deleteError)
        // 파일이 없어도 데이터베이스에서는 삭제
      }

    } catch (urlError) {
      console.error('Error parsing image URL:', urlError)
      // URL 파싱 실패해도 데이터베이스에서는 삭제
    }

    // 데이터베이스에서 이미지 레코드 삭제
    await prisma.adImage.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '이미지가 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: '이미지 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}