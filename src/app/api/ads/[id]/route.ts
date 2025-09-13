import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AdResponse } from '@/types/ad';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ID로 먼저 조회
    let ad = await prisma.ad.findFirst({
      where: { 
        id,
        isActive: true,
      },
      include: {
        category: true,
        district: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // ID로 찾지 못하면 slug로 조회
    if (!ad) {
      ad = await prisma.ad.findFirst({
        where: { 
          slug: id,
          isActive: true,
        },
        include: {
          category: true,
          district: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // AdResponse 타입에 isActive 필드 추가
    const adResponse: AdResponse & { isActive: boolean } = {
      id: ad.id,
      title: ad.title,
      slug: ad.slug,
      description: ad.description,
      location: ad.location as any,
      specs: ad.specs as any,
      pricing: ad.pricing as any,
      metadata: ad.metadata as any,
      category: {
        id: ad.category.id,
        name: ad.category.name,
      },
      district: {
        id: ad.district.id,
        name: ad.district.name,
        city: ad.district.city,
      },
      images: ad.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
      })),
      isActive: ad.isActive,
      createdAt: ad.createdAt.toISOString(),
      updatedAt: ad.updatedAt.toISOString(),
    };

    return NextResponse.json({ data: adResponse });
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}