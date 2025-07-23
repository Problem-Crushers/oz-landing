import { Video, AudioSegment, DownloadRequest, DownloadResponse, ApiResponse } from '@musicflow/shared/types';

// Video Service Contract
export interface VideoServiceContract {
  getVideoInfo(url: string): Promise<ApiResponse<Omit<Video, 'id' | 'downloadStatus'>>>;
  getVideoList(): Promise<ApiResponse<Video[]>>;
  deleteVideo(videoId: string): Promise<ApiResponse<void>>;
}

// Audio Analysis Service Contract
export interface AudioAnalysisContract {
  analyzeAudio(videoId: string): Promise<ApiResponse<{ videoId: string; segmentCount: number }>>;
  getAudioSegments(videoId: string): Promise<ApiResponse<AudioSegment[]>>;
}

// Download Service Contract
export interface DownloadServiceContract {
  startDownload(request: DownloadRequest): Promise<DownloadResponse>;
  getDownloadStatus(downloadId: string): Promise<ApiResponse<{ downloadId: string; status: string; progress: number }>>;
  cancelDownload(downloadId: string): Promise<ApiResponse<void>>;
}

// WebSocket Event Contracts
export interface SocketEvents {
  // Client to Server
  'download:subscribe': (downloadId: string) => void;
  'download:unsubscribe': (downloadId: string) => void;
  
  // Server to Client
  'download:progress': (data: { downloadId: string; progress: number; downloaded: number; total: number }) => void;
  'download:complete': (data: { downloadId: string; videoId: string }) => void;
  'download:error': (data: { downloadId: string; error: string }) => void;
  
  // Analysis events
  'analysis:start': (videoId: string) => void;
  'analysis:progress': (data: { videoId: string; progress: number }) => void;
  'analysis:complete': (data: { videoId: string; segmentCount: number }) => void;
}