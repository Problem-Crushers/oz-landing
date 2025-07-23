import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './slices/videoSlice';
import playerReducer from './slices/playerSlice';
import downloadReducer from './slices/downloadSlice';

export const store = configureStore({
  reducer: {
    video: videoReducer,
    player: playerReducer,
    download: downloadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;