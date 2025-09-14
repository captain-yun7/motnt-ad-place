// 에러 로깅 및 모니터링 유틸리티

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorMonitor {
  private static instance: ErrorMonitor;
  private isProduction = process.env.NODE_ENV === 'production';

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  // 클라이언트 에러 로깅
  public logClientError(
    error: Error | string,
    severity: ErrorLog['severity'] = 'medium',
    context?: Record<string, any>
  ): void {
    if (typeof window === 'undefined') return;

    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity,
      context,
    };

    // 개발 환경에서는 콘솔에 출력
    if (!this.isProduction) {
      console.error('Client Error:', errorLog);
      return;
    }

    // 프로덕션 환경에서는 서버로 전송
    this.sendErrorToServer(errorLog);
  }

  // 서버 에러 로깅
  public logServerError(
    error: Error | string,
    severity: ErrorLog['severity'] = 'high',
    context?: Record<string, any>
  ): void {
    const errorLog: Partial<ErrorLog> = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      severity,
      context,
    };

    // 개발 환경에서는 콘솔에 출력
    if (!this.isProduction) {
      console.error('Server Error:', errorLog);
      return;
    }

    // 프로덕션에서는 로그 파일이나 외부 서비스로 전송
    this.saveServerError(errorLog);
  }

  // API 에러 로깅
  public logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any,
    context?: Record<string, any>
  ): void {
    this.logServerError(
      `API Error: ${method} ${endpoint} - ${statusCode}`,
      statusCode >= 500 ? 'critical' : 'high',
      {
        endpoint,
        method,
        statusCode,
        error: error.message || error,
        ...context,
      }
    );
  }

  // 성능 메트릭 로깅
  public logPerformanceMetric(
    metricName: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms'
  ): void {
    if (!this.isProduction) {
      console.info(`Performance: ${metricName} = ${value}${unit}`);
      return;
    }

    // 프로덕션에서는 성능 메트릭을 수집
    const metric = {
      name: metricName,
      value,
      unit,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.sendMetricToServer(metric);
  }

  // 사용자 행동 추적
  public trackUserAction(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    if (!this.isProduction) {
      console.info(`User Action: ${category} - ${action}`, { label, value });
      return;
    }

    // Google Analytics 또는 다른 분석 도구로 전송
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  private async sendErrorToServer(errorLog: ErrorLog): Promise<void> {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (err) {
      // 에러 전송 실패 시 로컬 스토리지에 저장
      this.saveErrorToLocalStorage(errorLog);
    }
  }

  private saveServerError(errorLog: Partial<ErrorLog>): void {
    // 서버 에러는 파일 시스템이나 외부 로깅 서비스에 저장
    console.error('Server Error Log:', errorLog);
    
    // Sentry, LogRocket, 또는 다른 모니터링 서비스 연동 가능
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(errorLog.message));
    // }
  }

  private async sendMetricToServer(metric: any): Promise<void> {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (err) {
      // 메트릭 전송 실패는 무시 (성능에 영향 주지 않도록)
      console.warn('Failed to send metric:', err);
    }
  }

  private saveErrorToLocalStorage(errorLog: ErrorLog): void {
    try {
      const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errors.push(errorLog);
      
      // 최대 50개까지만 저장
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errors));
    } catch (err) {
      console.warn('Failed to save error to localStorage:', err);
    }
  }

  // 저장된 에러 로그를 서버로 전송
  public async flushLocalErrors(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      if (errors.length === 0) return;

      await fetch('/api/monitoring/errors/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errors),
      });

      localStorage.removeItem('errorLogs');
    } catch (err) {
      console.warn('Failed to flush local errors:', err);
    }
  }
}

// 전역 에러 핸들러 설정
export function setupGlobalErrorHandling(): void {
  const monitor = ErrorMonitor.getInstance();

  // 처리되지 않은 JavaScript 에러
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      monitor.logClientError(
        event.error || event.message,
        'high',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });

    // Promise rejection 에러
    window.addEventListener('unhandledrejection', (event) => {
      monitor.logClientError(
        event.reason,
        'high',
        {
          type: 'unhandledRejection',
        }
      );
    });

    // 페이지 로드 시 저장된 에러 전송
    window.addEventListener('load', () => {
      monitor.flushLocalErrors();
    });
  }
}

// 싱글톤 인스턴스 내보내기
export const errorMonitor = ErrorMonitor.getInstance();

// 편의 함수들
export const logError = (error: Error | string, severity?: ErrorLog['severity'], context?: Record<string, any>) => {
  errorMonitor.logClientError(error, severity, context);
};

export const logApiError = (endpoint: string, method: string, statusCode: number, error: any, context?: Record<string, any>) => {
  errorMonitor.logApiError(endpoint, method, statusCode, error, context);
};

export const logPerformance = (metricName: string, value: number, unit?: 'ms' | 'bytes' | 'count') => {
  errorMonitor.logPerformanceMetric(metricName, value, unit);
};

export const trackAction = (action: string, category: string, label?: string, value?: number) => {
  errorMonitor.trackUserAction(action, category, label, value);
};