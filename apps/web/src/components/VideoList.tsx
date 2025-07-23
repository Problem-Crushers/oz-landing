import { Link } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
}

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos }: VideoListProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Link
          key={video.id}
          to={`/player/${video.id}`}
          className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-video bg-gray-200 relative">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
              }}
            />
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}