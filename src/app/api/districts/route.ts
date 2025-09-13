import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            ads: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const districtsWithCount = districts.map(district => ({
      id: district.id,
      name: district.name,
      city: district.city,
      adCount: district._count.ads,
    }));

    return NextResponse.json({ data: districtsWithCount });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}