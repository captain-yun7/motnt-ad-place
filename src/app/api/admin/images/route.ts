import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { r2, R2_BUCKET, r2PublicUrl } from '@/lib/r2';

async function checkAdminAuth() {
  const session = await auth()
  return session?.user ?? null
}

// 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdminAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const adId = formData.get('adId') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '업로드할 이미지를 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!adId) {
      return NextResponse.json(
        { error: '광고 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 광고 존재 확인
    const ad = await prisma.ad.findUnique({
      where: { id: adId }
    })

    if (!ad) {
      return NextResponse.json(
        { error: '광고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const uploadedImages = []

    // 현재 이미지 개수 확인하여 order 설정
    const currentImageCount = await prisma.adImage.count({
      where: { adId }
    })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 파일 검증
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `${file.name}은(는) 이미지 파일이 아닙니다.` },
          { status: 400 }
        )
      }

      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `${file.name}의 크기가 너무 큽니다. (최대 10MB)` },
          { status: 400 }
        )
      }

      // 고유한 파일명 생성
      const fileExtension = file.name.split('.').pop()
      const key = `${adId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      try {
        // R2에 업로드
        const arrayBuffer = await file.arrayBuffer()
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: Buffer.from(arrayBuffer),
            ContentType: file.type,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )

        const publicUrl = r2PublicUrl(key)

        // 데이터베이스에 이미지 정보 저장
        const imageRecord = await prisma.adImage.create({
          data: {
            adId,
            url: publicUrl,
            alt: file.name.split('.')[0],
            order: currentImageCount + i,
            createdAt: new Date()
          }
        })

        uploadedImages.push({
          id: imageRecord.id,
          url: publicUrl,
          alt: imageRecord.alt,
          order: imageRecord.order,
          fileName: key
        })

      } catch (uploadError) {
        console.error('R2 upload error:', uploadError)
        return NextResponse.json(
          { error: `${file.name} 업로드 중 오류가 발생했습니다.` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: `${uploadedImages.length}개의 이미지가 성공적으로 업로드되었습니다.`,
      data: uploadedImages
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
