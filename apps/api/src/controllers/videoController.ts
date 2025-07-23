import { Request, Response, NextFunction } from 'express';
import ytdl from 'ytdl-core';
import { Video } from '../models/Video.js';

// YouTube URL에서 영상 정보 가져오기
export async function getVideoInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }
    
    // YouTube URL 유효성 검사
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL',
      });
    }
    
    // 영상 정보 가져오기
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    res.json({
      success: true,
      data: {
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        duration: parseInt(videoDetails.lengthSeconds),
        thumbnailUrl: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
        author: videoDetails.author.name,
        description: videoDetails.description,
        url: url,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 저장된 영상 목록 조회
export async function getVideoList(req: Request, res: Response, next: NextFunction) {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
}

// 영상 삭제
export async function deleteVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }
    
    // TODO: 실제 파일 삭제 로직 추가
    
    await video.deleteOne();
    
    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}