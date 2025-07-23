import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnailUrl: string;
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'error';
  filePath?: string;
  audioSegments?: AudioSegment[];
}

interface AudioSegment {
  startTime: number;
  endTime: number;
  type: 'music' | 'speech' | 'silence';
  confidence: number;
  recommendedSpeed: number;
}

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<Video[]>) => {
      state.videos = action.payload;
    },
    addVideo: (state, action: PayloadAction<Video>) => {
      state.videos.push(action.payload);
    },
    updateVideoStatus: (state, action: PayloadAction<{ id: string; status: Video['downloadStatus'] }>) => {
      const video = state.videos.find(v => v.id === action.payload.id);
      if (video) {
        video.downloadStatus = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setVideos, addVideo, updateVideoStatus, setLoading, setError } = videoSlice.actions;
export default videoSlice.reducer;