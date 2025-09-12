import { NextRequest, NextResponse } from 'next/server';
import { AdResponse, AdSearchParams } from '@/types/ad';
import { MOCK_ADS } from '../../../../docs/mock-data/ads';

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
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: (searchParams.get('sort') as 'price' | 'date' | 'title') || 'date',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    // 필터링 로직
    let filteredAds = [...MOCK_ADS];

    if (filters.category) {
      filteredAds = filteredAds.filter(ad => 
        ad.category.name.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    if (filters.district) {
      filteredAds = filteredAds.filter(ad => 
        ad.district.name.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }

    if (filters.query) {
      filteredAds = filteredAds.filter(ad => 
        ad.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
        ad.description?.toLowerCase().includes(filters.query!.toLowerCase())
      );
    }

    if (filters.priceMin || filters.priceMax) {
      filteredAds = filteredAds.filter(ad => {
        const price = ad.pricing.monthly;
        const minCheck = !filters.priceMin || price >= filters.priceMin;
        const maxCheck = !filters.priceMax || price <= filters.priceMax;
        return minCheck && maxCheck;
      });
    }

    // 정렬
    if (filters.sort === 'price') {
      filteredAds.sort((a, b) => {
        const diff = a.pricing.monthly - b.pricing.monthly;
        return filters.order === 'asc' ? diff : -diff;
      });
    } else if (filters.sort === 'title') {
      filteredAds.sort((a, b) => {
        const diff = a.title.localeCompare(b.title);
        return filters.order === 'asc' ? diff : -diff;
      });
    }

    // 페이지네이션
    const total = filteredAds.length;
    const skip = (filters.page! - 1) * filters.limit!;
    const paginatedAds = filteredAds.slice(skip, skip + filters.limit!);

    return NextResponse.json({
      data: paginatedAds,
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