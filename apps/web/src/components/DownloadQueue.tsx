import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function DownloadQueue() {
  const queue = useSelector((state: RootState) => state.download.queue);

  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        다운로드 대기열이 비어있습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 flex-1 mr-2">{item.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'downloading' ? 'bg-blue-100 text-blue-800' :
              item.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.status === 'completed' ? '완료' :
               item.status === 'downloading' ? '다운로드 중' :
               item.status === 'error' ? '오류' : '대기 중'}
            </span>
          </div>
          
          {item.status === 'downloading' && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.progress}%</p>
            </div>
          )}
          
          {item.error && (
            <p className="text-sm text-red-600 mt-2">{item.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}