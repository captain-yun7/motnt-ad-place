import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.info('Performance Metric:', metric);
      return NextResponse.json({ success: true });
    }

    // 프로덕션에서는 메트릭 수집 서비스로 전송
    console.info('Production Metric:', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: metric.timestamp,
      url: metric.url,
    });

    // 실제 구현에서는 다음과 같은 서비스들 사용 가능:
    // - Google Analytics
    // - DataDog
    // - New Relic
    // - Custom metrics endpoint

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Metrics logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log metric' },
      { status: 500 }
    );
  }
}