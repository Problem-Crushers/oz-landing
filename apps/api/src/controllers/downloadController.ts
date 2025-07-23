import { Request, Response, NextFunction } from 'express';
import ytdl from 'ytdl-core';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Video } from '../models/Video.js';
import { Server } from 'socket.io';

// 다운로드 시작
export async function startDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, quality = '720p' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL',
      });
    }
    
    const downloadId = uuidv4();
    const io: Server = req.app.get('io');
    
    // 영상 정보 가져오기
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    // 파일 경로 설정
    const videoDir = process.env.VIDEO_DIR || './uploads/videos';
    await fs.mkdir(videoDir, { recursive: true });
    
    const fileName = `${videoDetails.videoId}_${Date.now()}.mp4`;
    const filePath = path.join(videoDir, fileName);
    
    // DB에 영상 정보 저장
    const video = new Video({
      youtubeId: videoDetails.videoId,
      title: videoDetails.title,
      url: url,
      duration: parseInt(videoDetails.lengthSeconds),
      thumbnailUrl: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
      filePath: filePath,
      downloadStatus: 'downloading',
    });
    await video.save();
    
    // 다운로드 시작
    const stream = ytdl(url, {
      quality: quality === '720p' ? 'highest' : quality,
      filter: 'audioandvideo',
    });
    
    let downloadedBytes = 0;
    const totalBytes = parseInt(info.videoDetails.lengthSeconds) * 1000000; // 대략적인 크기
    
    stream.on('progress', (chunkLength, downloaded, total) => {
      downloadedBytes = downloaded;
      const progress = Math.round((downloaded / total) * 100);
      
      // Socket.io로 진행률 전송
      io.emit(`download:${downloadId}`, {
        progress,
        downloaded,
        total,
      });
    });
    
    // 파일로 저장
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);
    
    stream.on('end', async () => {
      video.downloadStatus = 'completed';
      await video.save();
      
      io.emit(`download:${downloadId}`, {
        status: 'completed',
        videoId: video._id,
      });
    });
    
    stream.on('error', async (error) => {
      console.error('Download error:', error);
      video.downloadStatus = 'error';
      await video.save();
      
      io.emit(`download:${downloadId}`, {
        status: 'error',
        error: error.message,
      });
    });
    
    res.json({
      success: true,
      data: {
        downloadId,
        videoId: video._id,
        title: videoDetails.title,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 다운로드 상태 조회
export async function getDownloadStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { downloadId } = req.params;
    
    // TODO: 실제 다운로드 상태 조회 로직
    res.json({
      success: true,
      data: {
        downloadId,
        status: 'downloading',
        progress: 50,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 다운로드 취소
export async function cancelDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const { downloadId } = req.params;
    
    // TODO: 실제 다운로드 취소 로직
    res.json({
      success: true,
      message: 'Download cancelled',
    });
  } catch (error) {
    next(error);
  }
}