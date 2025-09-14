import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorLogs = await request.json();
    
    if (!Array.isArray(errorLogs)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(`Batch Client Errors (${errorLogs.length}):`, errorLogs);
      return NextResponse.json({ 
        success: true, 
        processed: errorLogs.length 
      });
    }

    // 프로덕션에서는 배치로 처리
    for (const errorLog of errorLogs) {
      console.error('Batch Production Client Error:', {
        timestamp: errorLog.timestamp,
        message: errorLog.message,
        url: errorLog.url,
        severity: errorLog.severity,
      });
    }

    // 심각한 에러가 많은 경우 알림
    const criticalErrors = errorLogs.filter(log => log.severity === 'critical');
    if (criticalErrors.length > 0) {
      await notifyBatchCriticalErrors(criticalErrors);
    }

    return NextResponse.json({ 
      success: true, 
      processed: errorLogs.length,
      criticalCount: criticalErrors.length
    });
  } catch (error) {
    console.error('Batch error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to process batch errors' },
      { status: 500 }
    );
  }
}

async function notifyBatchCriticalErrors(criticalErrors: any[]) {
  console.error(`🚨 ${criticalErrors.length} CRITICAL ERRORS DETECTED:`, criticalErrors);
  
  // 실제 구현에서는 외부 알림 서비스 사용
}