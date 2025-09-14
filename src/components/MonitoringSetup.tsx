'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandling, logPerformance } from '@/lib/monitoring';

export default function MonitoringSetup() {
  useEffect(() => {
    // 전역 에러 핸들링 설정
    setupGlobalErrorHandling();

    // 성능 메트릭 측정
    if (typeof window !== 'undefined') {
      // 페이지 로드 시간 측정
      const startTime = performance.now();
      
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        logPerformance('page_load_time', loadTime, 'ms');
      });

      // Core Web Vitals 측정 (실제 구현에서는 web-vitals 라이브러리 사용)
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                logPerformance('largest_contentful_paint', entry.startTime, 'ms');
              }
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }

      // 네트워크 상태 모니터링
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        logPerformance('network_effective_type', connection.effectiveType === '4g' ? 4 : 
                      connection.effectiveType === '3g' ? 3 : 
                      connection.effectiveType === '2g' ? 2 : 1, 'count');
      }
    }
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}