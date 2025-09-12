import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES } from '../../../../docs/mock-data/ads';

export async function GET() {
  try {
    return NextResponse.json({ data: MOCK_CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}