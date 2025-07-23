import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  youtubeId: string;
  title: string;
  url: string;
  duration: number;
  thumbnailUrl: string;
  filePath?: string;
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'error';
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    youtubeId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
    },
    downloadStatus: {
      type: String,
      enum: ['pending', 'downloading', 'completed', 'error'],
      default: 'pending',
    },
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model<IVideo>('Video', VideoSchema);