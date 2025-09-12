import { NextResponse } from 'next/server';
import { MOCK_DISTRICTS } from '../../../../docs/mock-data/ads';

export async function GET() {
  try {
    return NextResponse.json({ data: MOCK_DISTRICTS });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}