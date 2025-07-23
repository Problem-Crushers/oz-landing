import { Router } from 'express';
import { getVideoInfo, getVideoList, deleteVideo } from '../controllers/videoController.js';

const router = Router();

// 영상 정보 조회
router.post('/info', getVideoInfo);

// 저장된 영상 목록 조회
router.get('/list', getVideoList);

// 영상 삭제
router.delete('/:videoId', deleteVideo);

export default router;