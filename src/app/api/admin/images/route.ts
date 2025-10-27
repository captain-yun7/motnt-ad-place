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

    const supabase = await createClient()
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
      const fileName = `${adId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

      try {
        // Supabase Storage에 업로드
        const { data, error } = await supabase.storage
          .from('motnt-ad-place-bucket')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', error)
          return NextResponse.json(
            { error: `이미지 업로드 실패: ${error.message}` },
            { status: 500 }
          )
        }

        // 업로드된 파일의 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
          .from('motnt-ad-place-bucket')
          .getPublicUrl(fileName)

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
          fileName: fileName
        })

      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
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