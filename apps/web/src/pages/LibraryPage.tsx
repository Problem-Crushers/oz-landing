import { useSelector } from 'react-redux';
import { RootState } from '../store';
import VideoList from '../components/VideoList';

export default function LibraryPage() {
  const videos = useSelector((state: RootState) => state.video.videos);
  const completedVideos = videos.filter(v => v.downloadStatus === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">다운로드된 영상</h2>
        
        {completedVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            아직 다운로드된 영상이 없습니다.
          </div>
        ) : (
          <VideoList videos={completedVideos} />
        )}
      </div>
    </div>
  );
}