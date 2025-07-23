import { Router } from 'express';
import { startDownload, getDownloadStatus, cancelDownload } from '../controllers/downloadController.js';

const router = Router();

// 다운로드 시작
router.post('/start', startDownload);

// 다운로드 상태 조회
router.get('/status/:downloadId', getDownloadStatus);

// 다운로드 취소
router.delete('/cancel/:downloadId', cancelDownload);

export default router;