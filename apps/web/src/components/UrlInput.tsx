import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToQueue } from '../store/slices/downloadSlice';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    // YouTube URL 유효성 검사
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      alert('유효한 YouTube URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: API 호출하여 영상 정보 가져오기
      const mockVideo = {
        id: Date.now().toString(),
        url,
        title: 'YouTube 영상 제목',
      };
      
      dispatch(addToQueue(mockVideo));
      setUrl('');
      alert('다운로드 대기열에 추가되었습니다.');
    } catch (error) {
      alert('영상 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          YouTube URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="input-field"
          disabled={loading}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="btn-primary w-full"
      >
        {loading ? '처리 중...' : '다운로드 추가'}
      </button>
    </form>
  );
}