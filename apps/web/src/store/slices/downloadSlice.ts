import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DownloadItem {
  id: string;
  url: string;
  title: string;
  progress: number;
  status: 'queued' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface DownloadState {
  queue: DownloadItem[];
  activeDownloads: number;
  maxConcurrentDownloads: number;
}

const initialState: DownloadState = {
  queue: [],
  activeDownloads: 0,
  maxConcurrentDownloads: 2,
};

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    addToQueue: (state, action: PayloadAction<Omit<DownloadItem, 'progress' | 'status'>>) => {
      state.queue.push({
        ...action.payload,
        progress: 0,
        status: 'queued',
      });
    },
    updateProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const item = state.queue.find(i => i.id === action.payload.id);
      if (item) {
        item.progress = action.payload.progress;
      }
    },
    updateStatus: (state, action: PayloadAction<{ id: string; status: DownloadItem['status']; error?: string }>) => {
      const item = state.queue.find(i => i.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
        if (action.payload.error) {
          item.error = action.payload.error;
        }
      }
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(item => item.id !== action.payload);
    },
    setActiveDownloads: (state, action: PayloadAction<number>) => {
      state.activeDownloads = action.payload;
    },
  },
});

export const {
  addToQueue,
  updateProgress,
  updateStatus,
  removeFromQueue,
  setActiveDownloads,
} = downloadSlice.actions;
export default downloadSlice.reducer;