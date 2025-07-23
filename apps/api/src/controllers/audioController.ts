import { Request, Response, NextFunction } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { Video } from '../models/Video.js';
import { AudioSegment } from '../models/AudioSegment.js';
import path from 'path';

// 오디오 분석 시작
export async function analyzeAudio(req: Request, res: Response, next: NextFunction) {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findById(videoId);
    if (!video || !video.filePath) {
      return res.status(404).json({
        success: false,
        error: 'Video not found or not downloaded yet',
      });
    }
    
    // TODO: 실제 오디오 분석 로직 구현
    // 임시로 기본 세그먼트 생성
    const segments = [
      {
        videoId: video._id,
        startTime: 0,
        endTime: 30,
        type: 'speech' as const,
        confidence: 0.9,
        recommendedSpeed: 1.5,
      },
      {
        videoId: video._id,
        startTime: 30,
        endTime: 60,
        type: 'music' as const,
        confidence: 0.85,
        recommendedSpeed: 1,
      },
    ];
    
    // 세그먼트 저장
    await AudioSegment.insertMany(segments);
    
    // 영상 분석 상태 업데이트
    video.isAnalyzed = true;
    await video.save();
    
    res.json({
      success: true,
      message: 'Audio analysis started',
      data: {
        videoId,
        segmentCount: segments.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 분석된 오디오 세그먼트 조회
export async function getAudioSegments(req: Request, res: Response, next: NextFunction) {
  try {
    const { videoId } = req.params;
    
    const segments = await AudioSegment.find({ videoId })
      .sort({ startTime: 1 });
    
    if (segments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No audio segments found for this video',
      });
    }
    
    res.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    next(error);
  }
}