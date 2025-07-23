import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAudioSegment extends Document {
  videoId: Types.ObjectId;
  startTime: number;
  endTime: number;
  type: 'music' | 'speech' | 'silence';
  confidence: number;
  recommendedSpeed: number;
  createdAt: Date;
  updatedAt: Date;
}

const AudioSegmentSchema = new Schema<IAudioSegment>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['music', 'speech', 'silence'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    recommendedSpeed: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// 복합 인덱스: videoId와 startTime으로 정렬된 조회 최적화
AudioSegmentSchema.index({ videoId: 1, startTime: 1 });

export const AudioSegment = mongoose.model<IAudioSegment>('AudioSegment', AudioSegmentSchema);