import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AdResponse, AdSearchParams } from '@/types/ad';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: AdSearchParams = {
      category: searchParams.get('category') || undefined,
      district: searchParams.get('district') || undefined,
      priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
      query: searchParams.get('query') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'), // 기본값 100개로 증가
      sort: (searchParams.get('sort') as 'price' | 'date' | 'title') || 'date',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const skip = (filters.page! - 1) * filters.limit!;

    // 검색 조건 구성
    const where: any = {
      isActive: true,
    };

    if (filters.category) {
      where.category = {
        name: filters.category,
      };
    }

    if (filters.district) {
      where.district = {
        name: filters.district,
      };
    }

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // 정렬 조건
    let orderBy: any = {};
    switch (filters.sort) {
      case 'price':
        // JSON 필드 정렬은 복잡하므로 일단 createdAt으로 대체
        orderBy = { createdAt: filters.order };
        break;
      case 'title':
        orderBy = { title: filters.order };
        break;
      default:
        orderBy = { createdAt: filters.order };
    }

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        include: {
          category: true,
          district: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
        skip,
        take: filters.limit,
        orderBy,
      }),
      prisma.ad.count({ where }),
    ]);

    // 타입 변환
    const adResponses: AdResponse[] = ads.map(ad => ({
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
    }));

    return NextResponse.json({
      data: adResponses,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit!),
      },
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}