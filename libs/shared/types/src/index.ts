// Video 관련 타입
export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  url: string;
  duration: number;
  thumbnailUrl: string;
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'error';
  filePath?: string;
  isAnalyzed?: boolean;
  audioSegments?: AudioSegment[];
  createdAt?: string;
  updatedAt?: string;
}

// 오디오 세그먼트 타입
export interface AudioSegment {
  id?: string;
  videoId: string;
  startTime: number;
  endTime: number;
  type: 'music' | 'speech' | 'silence';
  confidence: number;
  recommendedSpeed: number;
}

// 다운로드 관련 타입
export interface DownloadRequest {
  url: string;
  quality?: '720p' | '480p' | '360p' | 'audio';
}

export interface DownloadResponse {
  success: boolean;
  data?: {
    downloadId: string;
    videoId: string;
    title: string;
  };
  error?: string;
}

export interface DownloadProgress {
  downloadId: string;
  progress: number;
  downloaded?: number;
  total?: number;
  status?: 'downloading' | 'completed' | 'error';
  error?: string;
  videoId?: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 사용자 설정 타입
export interface UserPreferences {
  defaultSpeed: number;
  autoAnalyze: boolean;
  downloadQuality: '720p' | '480p' | '360p';
  maxConcurrentDownloads: number;
}