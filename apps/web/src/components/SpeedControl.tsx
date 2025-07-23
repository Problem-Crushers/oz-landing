import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPlaybackRate } from '../store/slices/playerSlice';

export default function SpeedControl() {
  const dispatch = useDispatch();
  const { playbackRate, currentSegmentType } = useSelector((state: RootState) => state.player);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleSpeedChange = (speed: number) => {
    dispatch(setPlaybackRate(speed));
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">재생 속도</h3>
      
      {currentSegmentType === 'music' && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-3 text-sm">
          🎵 음악 구간이 감지되어 1배속으로 재생 중입니다.
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-2">
        {speeds.map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedChange(speed)}
            disabled={currentSegmentType === 'music'}
            className={`py-2 px-3 rounded-lg font-medium transition-colors ${
              playbackRate === speed
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${
              currentSegmentType === 'music' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>현재 구간: {currentSegmentType === 'music' ? '음악' : currentSegmentType === 'speech' ? '음성' : '기타'}</p>
        <p>추천 속도: {currentSegmentType === 'music' ? '1x' : '1.5x'}</p>
      </div>
    </div>
  );
}