import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { r2, R2_BUCKET, r2KeyFromUrl } from '@/lib/r2';

async function checkAdminAuth() {
  const session = await auth()
  return session?.user ?? null
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

    // R2 키 추출 가능한 URL이면 R2에서도 삭제 (구 Supabase URL은 스킵)
    const key = r2KeyFromUrl(image.url)
    if (key) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
          })
        )
      } catch (deleteError) {
        console.error('R2 delete error:', deleteError)
        // 파일이 없어도 데이터베이스에서는 삭제
      }
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
