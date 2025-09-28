import { AdResponse } from '@/types/ad';

interface AdCardProps {
  ad: AdResponse;
  onClick: (ad: AdResponse) => void;
  isSelected?: boolean;
}

export default function AdCard({ ad, onClick, isSelected = false }: AdCardProps) {
  return (
    <div 
      className={`p-6 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(ad)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{ad.title}</h3>
          <p className="text-sm text-gray-500 mb-2 truncate">
            {ad.location?.address || '주소 정보 없음'}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span className="font-medium">월 {ad.pricing.monthly.toLocaleString()}원</span>
            <span>•</span>
            <span>일 노출 {Math.floor(Math.random() * 200000 + 50000).toLocaleString()}회</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex text-yellow-400 text-sm">
                ★★★★★
              </div>
              <span className="ml-2 text-sm text-gray-500">4.8 (124)</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {ad.category.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}