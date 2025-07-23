import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import SpeedControl from '../components/SpeedControl';

export default function PlayerPage() {
  const { videoId } = useParams<{ videoId: string }>();

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden">
        <VideoPlayer videoId={videoId!} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <SpeedControl />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold mb-2">음악 구간 표시</h3>
        <div className="text-sm text-gray-600">
          음악 구간은 자동으로 1배속으로 재생됩니다.
        </div>
      </div>
    </div>
  );
}