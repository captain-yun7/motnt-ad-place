import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AdResponse } from '@/types/ad';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const ad = await prisma.ad.findUnique({
      where: { 
        OR: [
          { id },
          { slug: id }, // slug으로도 조회 가능
        ],
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

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // 타입 변환
    const adResponse: AdResponse = {
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
      images: ad.images.map(img => ({
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