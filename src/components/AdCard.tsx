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
      className={`p-5 border-b-2 cursor-pointer transition-all ${
        isSelected
          ? 'bg-white border-l-4 shadow-md'
          : 'border-gray-100 hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-gray-300'
      }`}
      style={isSelected ? { borderLeftColor: '#B8312F' } : {}}
      onClick={() => onClick(ad)}
    >
      <div className="flex items-start space-x-4">
        {/* 이미지 썸네일 */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative border-2 border-gray-200">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0].url}
              alt={ad.images[0].alt || ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* 타이틀 */}
          <h3 className="font-bold text-gray-900 mb-1.5 text-base leading-tight line-clamp-2">{ad.title}</h3>

          {/* 주소 */}
          <p className="text-sm text-gray-600 mb-2.5 truncate font-medium">
            {ad.location?.address || '주소 정보 없음'}
          </p>

          {/* 가격 강조 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white px-3 py-1 rounded-md" style={{ backgroundColor: '#B8312F' }}>
                월 {ad.pricing.monthly.toLocaleString()}원
              </span>
              {ad.featured && (
                <span className="text-xs font-bold text-white px-2 py-1 rounded" style={{ backgroundColor: '#B8312F' }}>
                  추천
                </span>
              )}
            </div>
          </div>

          {/* 카테고리와 노출수 */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-300">
              {ad.category.name}
            </span>
            <span className="text-gray-500 font-semibold">
              일 노출 {dailyViews.toLocaleString()}회
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}