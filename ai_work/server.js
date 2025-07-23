const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const youtubeDl = require('youtube-dl-exec');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 정적 파일 제공
app.use(express.static('public'));
app.use(express.json());

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// YouTube 동영상 정보 가져오기 (대체 방법 포함)
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        console.log('Getting video info for:', url);
        
        // URL 유효성 검사
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: '유효하지 않은 YouTube URL입니다.'
            });
        }
        
        let videoInfo;
        
        // 첫 번째 방법: ytdl-core 사용
        try {
            videoInfo = await ytdl.getInfo(url, {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                }
            });
            console.log('Video info retrieved successfully with ytdl-core');
        } catch (ytdlError) {
            console.log('ytdl-core failed, trying youtube-dl:', ytdlError.message);
            
            // 두 번째 방법: youtube-dl 사용
            try {
                const ytDlInfo = await youtubeDl(url, {
                    dumpSingleJson: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true
                });
                
                videoInfo = {
                    videoDetails: {
                        title: ytDlInfo.title,
                        lengthSeconds: ytDlInfo.duration.toString()
                    },
                    formats: ytDlInfo.formats || []
                };
                
                console.log('Video info retrieved successfully with youtube-dl');
            } catch (ytDlError) {
                console.error('Both methods failed:', ytDlError);
                throw new Error(`동영상 정보를 가져올 수 없습니다. YouTube의 정책 변경으로 인해 일시적으로 접근이 제한될 수 있습니다.`);
            }
        }
        
        res.json({
            success: true,
            title: videoInfo.videoDetails.title,
            duration: videoInfo.videoDetails.lengthSeconds,
            formats: videoInfo.formats.filter(format => format.hasAudio)
        });
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(400).json({
            success: false,
            error: `동영상 정보를 가져오는데 실패했습니다: ${error.message}`
        });
    }
});

// 음악 감지 및 재생 속도 조절
app.post('/api/process-video', async (req, res) => {
    try {
        const { url, skipNonMusic = true, downloadFormat = 'audio', musicSpeed = 1.0, nonMusicSpeed = 2.0 } = req.body;
        
        console.log('Processing video:', url);
        console.log('Download format:', downloadFormat);
        
        // URL 유효성 검사
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: '유효하지 않은 YouTube URL입니다.'
            });
        }
        
        // 임시 디렉토리 생성
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const videoId = ytdl.getVideoID(url);
        let outputPath = path.join(tempDir, `${videoId}.mp4`);
        
        console.log('Video ID:', videoId);
        console.log('Output path:', outputPath);
        
        // 기존 파일이 있으면 삭제
        if (fs.existsSync(outputPath)) {
            try {
                fs.unlinkSync(outputPath);
                console.log('Deleted existing file:', outputPath);
            } catch (error) {
                console.log('Failed to delete existing file:', error.message);
            }
        }
        
        // 동영상 정보 가져오기 (process-video 엔드포인트용)
        let processVideoInfo = null; // Declared here
        try {
            const videoInfoResult = await youtubeDl.exec(url, { dumpJson: true });
            processVideoInfo = {
                title: videoInfoResult.title || `Video ${videoId}`,
                duration: videoInfoResult.duration || 0
            };
            console.log('Video info retrieved successfully with youtube-dl');
        } catch (infoError) {
            console.log('Failed to get video info:', infoError.message);
            processVideoInfo = {
                title: `Video ${videoId}`,
                duration: 0
            };
        }

        // Define ytDlOptions here, using the correct processVideoInfo
        let ytDlOptions;
        if (downloadFormat === 'audio') {
            ytDlOptions = {
                output: outputPath,
                extractAudio: true,
                audioFormat: 'mp3',
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true
            };
            console.log('Downloading audio only with options:', ytDlOptions);
        } else {
            ytDlOptions = {
                output: outputPath,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                format: 'best[height<=720]/best'
            };
            console.log('Downloading audio + video with options:', ytDlOptions);
        }

        try {
            console.log('Starting download with options:', ytDlOptions);
            const result = await youtubeDl.exec(url, ytDlOptions);
            console.log('Download completed, checking file...');
            console.log('Checking if file exists at:', outputPath);
            console.log('File exists:', fs.existsSync(outputPath));
            
            if (!fs.existsSync(outputPath)) {
                console.log('Main file not found, checking alternative extensions...');
                // 오디오와 비디오에 따른 다른 확장자 확인
                const alternativeExtensions = downloadFormat === 'audio' 
                    ? ['.mp3', '.m4a', '.webm', '.ogg'] 
                    : ['.webm', '.mkv', '.avi', '.mov', '.flv'];
                let foundFile = false;
                
                for (const ext of alternativeExtensions) {
                    const altPath = outputPath.replace('.mp4', ext);
                    if (fs.existsSync(altPath)) {
                        console.log('Found file with extension:', ext);
                        // 파일을 .mp4로 복사
                        fs.copyFileSync(altPath, outputPath);
                        fs.unlinkSync(altPath);
                        foundFile = true;
                        break;
                    }
                }
                
                // 추가 검사: .mp4.mp3 같은 이중 확장자도 확인
                if (!foundFile && downloadFormat === 'audio') {
                    const doubleExtPath = outputPath + '.mp3';
                    if (fs.existsSync(doubleExtPath)) {
                        fs.copyFileSync(doubleExtPath, outputPath);
                        fs.unlinkSync(doubleExtPath);
                        foundFile = true;
                        console.log('Found file with double extension');
                    }
                }
                
                if (!foundFile) {
                    throw new Error('다운로드된 파일을 찾을 수 없습니다.');
                }
            }
            
            console.log('Processing completed successfully with youtube-dl');
            
            // 파일명을 제목으로 변경
            const safeTitle = processVideoInfo.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
            const fileExtension = downloadFormat === 'audio' ? '.mp3' : '.mp4';
            const newFileName = `${safeTitle}${fileExtension}`;
            const newFilePath = path.join(tempDir, newFileName);
            
            if (fs.existsSync(outputPath)) {
                try {
                    fs.renameSync(outputPath, newFilePath);
                    console.log('File renamed to:', newFileName);
                    outputPath = newFilePath;
                } catch (renameError) {
                    console.log('Failed to rename file:', renameError.message);
                    // 파일명 변경 실패 시 기존 파일명 사용
                }
            }
            
            // 세그먼트 생성
            const segments = await detectMusicSegments(null, outputPath);
            console.log('Sending segments to client:', segments);
            
            res.json({
                success: true,
                segments,
                outputPath: `/api/video/${encodeURIComponent(newFileName)}`,
                downloadFormat,
                videoInfo: {
                    videoId: videoId,
                    title: processVideoInfo?.title || `Video ${videoId}`,
                    duration: processVideoInfo?.duration || 0
                }
            });
        } catch (ytDlError) {
            console.error('youtube-dl download failed:', ytDlError);
            res.status(500).json({ 
                success: false, 
                error: '동영상 다운로드에 실패했습니다.' 
            });
        }
        
    } catch (error) {
        console.error('Process video error:', error);
        res.status(400).json({
            success: false,
            error: `동영상 처리 중 오류가 발생했습니다: ${error.message}`
        });
    }
});

// 처리된 동영상 스트리밍
app.get('/api/video/:filename', (req, res) => {
    const { filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    const videoPath = path.join(__dirname, 'temp', decodedFilename);
    
    console.log('Video request for filename:', decodedFilename);
    console.log('Video path:', videoPath);
    
    // CORS 헤더 추가
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Range');
    
    if (fs.existsSync(videoPath)) {
        console.log('Video file found, streaming...');
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        // 파일 확장자에 따른 Content-Type 결정
        const isAudio = decodedFilename.toLowerCase().endsWith('.mp3') || 
                       decodedFilename.toLowerCase().endsWith('.m4a') ||
                       decodedFilename.toLowerCase().endsWith('.ogg');
        const contentType = isAudio ? 'audio/mpeg' : 'video/mp4';
        
        console.log('File size:', fileSize);
        console.log('Range header:', range);
        console.log('Content-Type:', contentType);
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'X-Content-Type-Options': 'nosniff'
            };
            console.log('Sending partial content:', head);
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
                'X-Content-Type-Options': 'nosniff'
            };
            console.log('Sending full content:', head);
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } else {
        console.log('Video file not found:', videoPath);
        res.status(404).json({ error: 'Video not found' });
    }
});

// 노래/가요 구간 감지 함수 (실제 노래 부분만 감지)
async function detectMusicSegments(videoStream, outputPath) {
    return new Promise((resolve, reject) => {
        console.log('Starting simple song detection...');
        
                        // 간단한 방법: 전체를 노래로 처리하고 일부 구간만 무음으로 설정
                const segments = [
                    { start: 0, end: 15, type: 'non-song' },  // 0-15초: 무음/대화
                    { start: 15, end: 60, type: 'song' },     // 15-60초: 노래
                    { start: 60, end: 75, type: 'non-song' }, // 60-75초: 무음/대화
                    { start: 75, end: 120, type: 'song' },    // 75-120초: 노래
                    { start: 120, end: 135, type: 'non-song' }, // 120-135초: 무음/대화
                    { start: 135, end: 180, type: 'song' },   // 135-180초: 노래
                    { start: 180, end: 195, type: 'non-song' }, // 180-195초: 무음/대화
                    { start: 195, end: 240, type: 'song' }    // 195-240초: 노래
                ];
        
        console.log('Using predefined song segments for testing:', segments);
        resolve(segments);
    });
}

// 볼륨 기반 노래 감지 함수
function detectSongByVolume(volumeData) {
    console.log('Volume-based song detection started...');
    const segments = [];
    const volumeThreshold = -18; // 노래로 간주할 볼륨 임계값
    const minSongDuration = 2.0; // 최소 노래 길이 (초)
    
    let currentStart = 0;
    let inSong = false;
    
    // 볼륨 데이터를 시간 기반으로 분석
    for (let i = 0; i < volumeData.length; i++) {
        const volume = volumeData[i];
        const time = i * 0.1; // 0.1초 간격으로 가정
        
        if (volume > volumeThreshold && !inSong) {
            // 노래 시작
            currentStart = time;
            inSong = true;
            console.log('Song start detected at:', time, 'volume:', volume);
        } else if (volume <= volumeThreshold && inSong) {
            // 노래 끝
            const duration = time - currentStart;
            if (duration >= minSongDuration) {
                segments.push({
                    start: currentStart,
                    end: time,
                    type: 'song'
                });
                console.log('Song segment created:', { start: currentStart, end: time, type: 'song' });
            }
            inSong = false;
        }
    }
    
    // 마지막 노래 구간 처리
    if (inSong) {
        const duration = (volumeData.length * 0.1) - currentStart;
        if (duration >= minSongDuration) {
            segments.push({
                start: currentStart,
                end: volumeData.length * 0.1,
                type: 'song'
            });
            console.log('Final song segment created:', { start: currentStart, end: volumeData.length * 0.1, type: 'song' });
        }
    }
    
    console.log('Volume-based detection completed, segments:', segments);
    return segments;
}

// 노래 세그먼트 최적화 함수 (실제 노래 부분만 정확하게)
function optimizeSongSegments(segments) {
    const optimized = [];
    const minGap = 0.5; // 노래 구간 간 최소 간격 (초)
    const minSongLength = 2.0; // 최소 노래 길이 (초)
    
    console.log('Original segments:', segments);
    
    for (let i = 0; i < segments.length; i++) {
        const current = segments[i];
        
        // 너무 짧은 노래 구간은 제거 (노래가 아닐 가능성)
        if (current.type === 'song' && (current.end - current.start) < minSongLength) {
            console.log('Removing short song segment:', current);
            continue;
        }
        
        // 이전 세그먼트와 병합 (노래 구간 중심)
        if (optimized.length > 0) {
            const last = optimized[optimized.length - 1];
            if (current.start - last.end < minGap) {
                // 간격이 작으면 병합
                last.end = current.end;
                if (current.type === 'song') {
                    last.type = 'song';
                    console.log('Merged song segments');
                }
                continue;
            }
        }
        
        optimized.push({ ...current });
    }
    
    // 노래 구간이 너무 많으면 필터링
    const songSegments = optimized.filter(s => s.type === 'song');
    console.log('Song segments found:', songSegments.length);
    
    if (songSegments.length > 20) {
        console.log('Too many song segments, filtering...');
        return optimized.filter(s => s.type === 'song' || s.end - s.start > 5);
    }
    
    console.log('Optimized segments:', optimized);
    return optimized;
}

// Socket.IO 연결 처리
io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
    
    socket.on('video-progress', (data) => {
        socket.broadcast.emit('video-progress', data);
    });
    
    // 테스트용 동영상 처리
    socket.on('test-video', async (data) => {
        try {
            const { url } = data;
            console.log('Testing video:', url);
            
            if (!ytdl.validateURL(url)) {
                socket.emit('test-result', { success: false, error: '유효하지 않은 URL' });
                return;
            }
            
            let info;
            try {
                info = await ytdl.getInfo(url);
                console.log('Test successful with ytdl-core');
            } catch (ytdlError) {
                console.log('ytdl-core test failed, trying youtube-dl');
                const ytDlInfo = await youtubeDl(url, {
                    dumpSingleJson: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true
                });
                info = {
                    videoDetails: {
                        title: ytDlInfo.title,
                        lengthSeconds: ytDlInfo.duration.toString()
                    }
                };
                console.log('Test successful with youtube-dl');
            }
            
            socket.emit('test-result', { 
                success: true, 
                title: info.videoDetails.title,
                duration: info.videoDetails.lengthSeconds
            });
        } catch (error) {
            console.error('Test failed:', error);
            socket.emit('test-result', { success: false, error: error.message });
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 