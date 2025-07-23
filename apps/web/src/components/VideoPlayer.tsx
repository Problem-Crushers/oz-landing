import { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { play, pause, setCurrentTime, setDuration } from '../store/slices/playerSlice';

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dispatch = useDispatch();
  const { isPlaying, playbackRate } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(video.currentTime));
    };

    const handleLoadedMetadata = () => {
      dispatch(setDuration(video.duration));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [dispatch]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  };

  return (
    <div className="relative aspect-video bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        onClick={handlePlayPause}
        // TODO: 실제 비디오 파일 경로로 변경
        src={`/videos/${videoId}.mp4`}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <button
          onClick={handlePlayPause}
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg"
        >
          {isPlaying ? '일시정지' : '재생'}
        </button>
      </div>
    </div>
  );
}