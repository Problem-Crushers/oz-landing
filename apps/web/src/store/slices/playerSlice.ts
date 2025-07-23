import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  currentSegmentType: 'music' | 'speech' | 'silence' | null;
}

const initialState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  currentSegmentType: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setCurrentSegmentType: (state, action: PayloadAction<PlayerState['currentSegmentType']>) => {
      state.currentSegmentType = action.payload;
    },
  },
});

export const {
  play,
  pause,
  setCurrentTime,
  setDuration,
  setPlaybackRate,
  setVolume,
  setCurrentSegmentType,
} = playerSlice.actions;
export default playerSlice.reducer;