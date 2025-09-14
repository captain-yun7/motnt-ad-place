import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json();
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error:', errorLog);
      return NextResponse.json({ success: true });
    }

    // 프로덕션에서는 로깅 서비스로 전송
    // 예: Sentry, LogRocket, DataDog 등
    
    // 임시로 콘솔에 출력 (실제로는 외부 서비스 사용)
    console.error('Production Client Error:', {
      timestamp: errorLog.timestamp,
      message: errorLog.message,
      url: errorLog.url,
      severity: errorLog.severity,
      userAgent: errorLog.userAgent,
      context: errorLog.context,
    });

    // 중요한 에러의 경우 알림 발송 (예: Slack, 이메일)
    if (errorLog.severity === 'critical') {
      await notifyHighSeverityError(errorLog);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging service failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

async function notifyHighSeverityError(errorLog: any) {
  // 실제 구현에서는 Slack webhook, 이메일 서비스 등 사용
  console.error('🚨 CRITICAL ERROR DETECTED:', errorLog);
  
  // 예시: Slack 알림
  /*
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical Error in Motnt Ad Place`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Message', value: errorLog.message, short: false },
            { title: 'URL', value: errorLog.url, short: true },
            { title: 'Timestamp', value: errorLog.timestamp, short: true }
          ]
        }]
      })
    });
  } catch (err) {
    console.error('Failed to send Slack notification:', err);
  }
  */
}