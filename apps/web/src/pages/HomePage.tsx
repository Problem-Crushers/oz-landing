import { useState } from 'react';
import UrlInput from '../components/UrlInput';
import DownloadQueue from '../components/DownloadQueue';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'input' | 'queue'>('input');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">YouTube 영상 다운로드</h2>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'input'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            URL 입력
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            다운로드 대기열
          </button>
        </div>
        
        {activeTab === 'input' ? <UrlInput /> : <DownloadQueue />}
      </div>
    </div>
  );
}