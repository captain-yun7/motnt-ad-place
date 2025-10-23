import { AdResponse } from '@/types/ad';

interface AdCardProps {
  ad: AdResponse;
  onClick: (ad: AdResponse) => void;
  isSelected?: boolean;
}

export default function AdCard({ ad, onClick, isSelected = false }: AdCardProps) {
  const dailyViews = ad.metadata?.performanceMetrics?.averageViews || ad.viewCount * 10;

  return (
    <div
      className={`p-6 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(ad)}
    >
      <div className="flex items-start space-x-4">
        {/* 이미지 썸네일 */}
        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0].url}
              alt={ad.images[0].alt || ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* 타이틀과 배지 */}
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate flex-1">{ad.title}</h3>
            <div className="flex gap-1 flex-shrink-0">
              {ad.featured && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  추천
                </span>
              )}
              {ad.verified && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-2 truncate">
            {ad.location?.address || '주소 정보 없음'}
          </p>

          {/* 가격 및 노출수 */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="font-medium">월 {ad.pricing.monthly.toLocaleString()}원</span>
            <span>•</span>
            <span>일 노출 {dailyViews.toLocaleString()}회</span>
          </div>

          {/* 태그 및 카테고리 */}
          <div className="flex items-center gap-2 flex-wrap">
            {ad.tags && ad.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full ml-auto">
              {ad.category.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}