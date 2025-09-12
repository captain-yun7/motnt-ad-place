import { NextRequest, NextResponse } from 'next/server';
import { AdResponse } from '@/types/ad';
import { MOCK_ADS } from '../../../../../docs/mock-data/ads';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const ad = MOCK_ADS.find(ad => ad.id === id || ad.slug === id);

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: ad });
  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}