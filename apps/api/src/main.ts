import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middlewares/errorHandler.js';
import videoRoutes from './routes/videoRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';

// 환경변수 로드
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io를 앱에 연결
app.set('io', io);

// 라우트
app.use('/api/videos', videoRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/download', downloadRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 에러 핸들러
app.use(errorHandler);

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 서버 시작
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // MongoDB 연결
    await connectDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();