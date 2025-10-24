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

    const adResponse: AdResponse = {
      id: ad.id,
      title: ad.title,
      slug: ad.slug,
      description: ad.description,
      location: ad.location as any,
      specs: ad.specs as any,
      pricing: ad.pricing as any,
      availability: ad.availability as any,
      metadata: ad.metadata as any,
      // Phase 1 필드 추가
      status: ad.status,
      featured: ad.featured,
      tags: ad.tags,
      viewCount: ad.viewCount,
      favoriteCount: ad.favoriteCount,
      inquiryCount: ad.inquiryCount,
      verified: ad.verified,
      verifiedAt: ad.verifiedAt?.toISOString() || null,
      isActive: ad.isActive,
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