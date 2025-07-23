import { Router } from 'express';
import { analyzeAudio, getAudioSegments } from '../controllers/audioController.js';

const router = Router();

// 오디오 분석 시작
router.post('/analyze/:videoId', analyzeAudio);

// 분석된 오디오 세그먼트 조회
router.get('/segments/:videoId', getAudioSegments);

export default router;