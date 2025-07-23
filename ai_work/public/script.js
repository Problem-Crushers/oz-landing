// Socket.IO 연결
const socket = io();

// 전역 변수들
let currentSegments = [];
let currentSegmentIndex = 0;
let downloadHistory = [];

// DOM 요소들
const youtubeUrlInput = document.getElementById('youtubeUrl');
const loadVideoBtn = document.getElementById('loadVideo');
const processVideoBtn = document.getElementById('processVideo');
const skipNonMusicCheckbox = document.getElementById('skipNonMusic');
const downloadFormatSelect = document.getElementById('downloadFormat');
const musicSpeedRange = document.getElementById('musicSpeed');
const nonMusicSpeedRange = document.getElementById('nonMusicSpeed');
const musicSpeedValue = document.getElementById('musicSpeedValue');
const nonMusicSpeedValue = document.getElementById('nonMusicSpeedValue');
const videoInfoDiv = document.getElementById('videoInfo');
const videoDetailsDiv = document.getElementById('videoDetails');
const playerSectionDiv = document.getElementById('playerSection');
const segmentsTimelineDiv = document.getElementById('segmentsTimeline');
const videoPlayer = document.getElementById('videoPlayer');
const audioPlayer = document.getElementById('audioPlayer');
const videoSource = document.getElementById('videoSource');
const audioSource = document.getElementById('audioSource');
const loadingDiv = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const progressFill = document.getElementById('progressFill');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const errorHelp = document.getElementById('errorHelp');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const refreshHistoryBtn = document.getElementById('refreshHistory');

// 네비게이션 관련 요소들
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// 네비게이션 기능
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 모든 네비게이션 아이템에서 active 클래스 제거
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 클릭된 아이템에 active 클래스 추가
            item.classList.add('active');
            
            // 모든 섹션 숨기기
            contentSections.forEach(section => section.classList.remove('active'));
            
            // 해당 섹션 보이기
            const targetSection = item.getAttribute('data-section');
            const sectionToShow = document.getElementById(targetSection);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
        });
    });
}

// 샘플 비디오 로드 함수
function loadSampleVideo(url) {
    youtubeUrlInput.value = url;
    showLoading('샘플 동영상을 로드했습니다. "동영상 처리 및 재생" 버튼을 클릭하세요.');
    setTimeout(hideLoading, 2000);
}

// 로딩 표시/숨김
function showLoading(message = '동영상을 처리하고 있습니다...') {
    loadingMessage.textContent = message;
    loadingDiv.style.display = 'flex';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

// 에러 표시/숨김
function showError(message, showHelp = false) {
    errorMessage.textContent = message;
    errorDiv.style.display = 'flex';
    if (showHelp) {
        errorHelp.style.display = 'block';
    } else {
        errorHelp.style.display = 'none';
    }
}

function hideError() {
    errorDiv.style.display = 'none';
}

// 비디오 정보 표시
function showVideoInfo(videoInfo) {
    videoDetailsDiv.innerHTML = `
        <div class="video-info-grid">
            <div class="info-item">
                <strong>제목:</strong> ${videoInfo.title}
            </div>
            <div class="info-item">
                <strong>동영상 ID:</strong> ${videoInfo.videoId}
            </div>
            <div class="info-item">
                <strong>재생 시간:</strong> ${formatDuration(videoInfo.duration)}
            </div>
        </div>
    `;
    videoInfoDiv.style.display = 'block';
}

// 재생 시간 포맷팅
function formatDuration(seconds) {
    if (!seconds) return '알 수 없음';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 플레이어 섹션 표시
function showPlayerSection() {
    playerSectionDiv.style.display = 'block';
}

// 동영상 로드
async function loadVideo() {
    const url = youtubeUrlInput.value.trim();
    
    if (!url) {
        showError('YouTube 동영상 URL을 입력해주세요.');
        return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        showError('올바른 YouTube URL을 입력해주세요.');
        return;
    }
    
    resetPlayer();
    showLoading('동영상 정보를 가져오는 중...');
    
    try {
        const response = await fetch('/api/video-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showVideoInfo(data.videoInfo);
            showPlayerSection();
            hideLoading();
        } else {
            hideLoading();
            showError(data.error || '동영상 정보를 가져오는데 실패했습니다.', true);
        }
    } catch (error) {
        hideLoading();
        showError('동영상 정보를 가져오는데 실패했습니다.', true);
    }
}

// 플레이어 초기화
function resetPlayer() {
    // 비디오 플레이어 초기화
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.src = '';
    videoPlayer.style.display = 'none';

    // 오디오 플레이어 초기화
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer.src = '';
    audioPlayer.style.display = 'none';

    // 플레이어 섹션 숨기기
    playerSectionDiv.style.display = 'none';

    // 세그먼트 타임라인 초기화
    segmentsTimelineDiv.innerHTML = '';
    currentSegments = [];
    currentSegmentIndex = 0;

    console.log('Player reset completed');
}

// 동영상 처리 및 재생
async function processVideo() {
    const url = youtubeUrlInput.value.trim();
    
    if (!url) {
        showError('YouTube 동영상 URL을 입력해주세요.');
        return;
    }
    
    const skipNonMusic = skipNonMusicCheckbox.checked;
    const downloadFormat = downloadFormatSelect.value;
    const musicSpeed = parseFloat(musicSpeedRange.value);
    const nonMusicSpeed = parseFloat(nonMusicSpeedRange.value);
    
    showLoading('동영상을 처리하고 있습니다...');
    
    try {
        const response = await fetch('/api/process-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                skipNonMusic,
                downloadFormat,
                musicSpeed,
                nonMusicSpeed
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            hideLoading();
            
            // 히스토리에 추가
            addToHistory(data.videoInfo, downloadFormat);
            
            // 세그먼트 표시
            displaySegments(data.segments);
            
            // 비디오/오디오 플레이어 로드
            loadVideoPlayer(data.outputPath, downloadFormat);
            
            showPlayerSection();
        } else {
            hideLoading();
            showError(data.error || '동영상 처리에 실패했습니다.', true);
        }
    } catch (error) {
        hideLoading();
        showError('동영상 처리 중 오류가 발생했습니다.', true);
    }
}

// 세그먼트 표시
function displaySegments(segments) {
    currentSegments = segments;
    segmentsTimelineDiv.innerHTML = '';
    
    segments.forEach((segment, index) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = `segment ${segment.type}`;
        segmentDiv.textContent = `${segment.start}s - ${segment.end}s`;
        segmentDiv.onclick = () => playSegment(segment);
        segmentsTimelineDiv.appendChild(segmentDiv);
    });
}

// 세그먼트 재생
function playSegment(segment) {
    const player = videoPlayer.style.display !== 'none' ? videoPlayer : audioPlayer;
    player.currentTime = segment.start;
    player.play();
}

// 비디오 플레이어 로드
function loadVideoPlayer(videoPath, downloadFormat = 'video') {
    console.log('Loading video player with path:', videoPath);
    console.log('Download format:', downloadFormat);
    
    // 기존 이벤트 리스너 제거 (안전하게)
    if (videoPlayer._loadedMetadataHandler) {
        videoPlayer.removeEventListener('loadedmetadata', videoPlayer._loadedMetadataHandler);
    }
    if (videoPlayer._errorHandler) {
        videoPlayer.removeEventListener('error', videoPlayer._errorHandler);
    }
    if (audioPlayer._loadedMetadataHandler) {
        audioPlayer.removeEventListener('loadedmetadata', audioPlayer._loadedMetadataHandler);
    }
    if (audioPlayer._errorHandler) {
        audioPlayer.removeEventListener('error', audioPlayer._errorHandler);
    }
    
    if (downloadFormat === 'audio') {
        // 오디오 플레이어 사용
        audioPlayer.style.display = 'block';
        videoPlayer.style.display = 'none';
        
        audioSource.src = videoPath;
        audioPlayer.load();
        
        audioPlayer._loadedMetadataHandler = () => {
            console.log('Audio loaded successfully');
            audioPlayer.play();
        };
        
        audioPlayer._errorHandler = (e) => {
            console.error('Audio error:', e);
            showError('오디오를 로드할 수 없습니다. 다시 시도해주세요.');
        };
        
        audioPlayer.addEventListener('loadedmetadata', audioPlayer._loadedMetadataHandler);
        audioPlayer.addEventListener('error', audioPlayer._errorHandler);
        
        // 3초 후에도 로드되지 않으면 직접 설정
        setTimeout(() => {
            if (audioPlayer.readyState === 0) {
                console.log('Forcing audio load...');
                audioPlayer.src = videoPath;
                audioPlayer.load();
            }
        }, 3000);
        
    } else {
        // 비디오 플레이어 사용
        videoPlayer.style.display = 'block';
        audioPlayer.style.display = 'none';
        
        videoSource.src = videoPath;
        videoPlayer.load();
        
        videoPlayer._loadedMetadataHandler = () => {
            console.log('Video loaded successfully');
            console.log('Video networkState:', videoPlayer.networkState);
            console.log('Video readyState:', videoPlayer.readyState);
            videoPlayer.play();
        };
        
        videoPlayer._errorHandler = (e) => {
            console.error('Video error:', e);
            console.log('Video networkState:', videoPlayer.networkState);
            console.log('Video readyState:', videoPlayer.readyState);
            showError('동영상을 로드할 수 없습니다. 다시 시도해주세요.');
        };
        
        videoPlayer.addEventListener('loadedmetadata', videoPlayer._loadedMetadataHandler);
        videoPlayer.addEventListener('error', videoPlayer._errorHandler);
        
        // 3초 후에도 로드되지 않으면 직접 설정
        setTimeout(() => {
            if (videoPlayer.readyState === 0) {
                console.log('Forcing video load...');
                videoPlayer.src = videoPath;
                videoPlayer.load();
            }
        }, 3000);
    }
}

// 재생 속도 업데이트
function updateMusicSpeed() {
    const value = musicSpeedRange.value;
    musicSpeedValue.textContent = `${value}x`;
}

function updateNonMusicSpeed() {
    const value = nonMusicSpeedRange.value;
    nonMusicSpeedValue.textContent = `${value}x`;
}

// 히스토리 관리
function initHistory() {
    loadHistory();
    renderHistory();
}

function loadHistory() {
    const saved = localStorage.getItem('downloadHistory');
    downloadHistory = saved ? JSON.parse(saved) : [];
}

function saveHistory() {
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
}

function addToHistory(videoInfo, downloadFormat) {
    const historyItem = {
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        duration: videoInfo.duration,
        downloadFormat: downloadFormat,
        timestamp: new Date().toISOString()
    };
    
    // 중복 제거 (같은 videoId가 있으면 제거)
    downloadHistory = downloadHistory.filter(item => item.videoId !== videoInfo.videoId);
    
    // 맨 앞에 추가
    downloadHistory.unshift(historyItem);
    
    // 최대 50개만 유지
    if (downloadHistory.length > 50) {
        downloadHistory = downloadHistory.slice(0, 50);
    }
    
    saveHistory();
    renderHistory();
    console.log('Added to history:', historyItem);
}

function renderHistory() {
    if (downloadHistory.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <p>다운로드 히스토리가 없습니다.</p>
                <p>동영상을 처리하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = downloadHistory.map(item => `
        <div class="history-item" onclick="loadFromHistory('${item.videoId}', '${item.title}')">
            <div class="history-item-header">
                <div class="history-title">${item.title}</div>
                <div class="history-format">${item.downloadFormat === 'audio' ? '🎵 오디오' : '🎬 비디오'}</div>
            </div>
            <div class="history-item-details">
                <div class="history-duration">
                    <i class="fas fa-clock"></i> ${formatDuration(item.duration)}
                </div>
                <div class="history-date">
                    <i class="fas fa-calendar"></i> ${formatHistoryDate(item.timestamp)}
                </div>
            </div>
            <button class="history-load-btn" onclick="event.stopPropagation(); loadFromHistory('${item.videoId}', '${item.title}')">
                <i class="fas fa-play"></i> 다시 재생
            </button>
        </div>
    `).join('');
}

function formatHistoryDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

function loadFromHistory(videoId, title) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    youtubeUrlInput.value = youtubeUrl;
    showVideoInfo({
        videoId: videoId,
        title: title,
        duration: 0
    });
    showPlayerSection();
    
    // 플레이어 섹션으로 이동
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-section="player"]').classList.add('active');
    contentSections.forEach(section => section.classList.remove('active'));
    document.getElementById('player').classList.add('active');
    
    console.log('Loaded from history:', { videoId, title });
    showLoading('히스토리에서 동영상을 불러왔습니다. "동영상 처리 및 재생" 버튼을 클릭하세요.');
    setTimeout(hideLoading, 2000);
}

function clearHistory() {
    if (confirm('모든 히스토리를 삭제하시겠습니까?')) {
        downloadHistory = [];
        saveHistory();
        renderHistory();
    }
}

// 이벤트 리스너들
loadVideoBtn.addEventListener('click', loadVideo);
processVideoBtn.addEventListener('click', processVideo);
musicSpeedRange.addEventListener('input', updateMusicSpeed);
nonMusicSpeedRange.addEventListener('input', updateNonMusicSpeed);
clearHistoryBtn.addEventListener('click', clearHistory);
refreshHistoryBtn.addEventListener('click', () => {
    renderHistory();
});

// 플레이어 컨트롤 버튼들
document.getElementById('playMusicOnly').addEventListener('click', () => {
    const musicSegments = currentSegments.filter(s => s.type === 'song');
    if (musicSegments.length > 0) {
        playSegment(musicSegments[0]);
    }
});

document.getElementById('playAll').addEventListener('click', () => {
    const player = videoPlayer.style.display !== 'none' ? videoPlayer : audioPlayer;
    player.play();
});

document.getElementById('skipToNextMusic').addEventListener('click', () => {
    const musicSegments = currentSegments.filter(s => s.type === 'song');
    if (musicSegments.length > 0) {
        const nextIndex = (currentSegmentIndex + 1) % musicSegments.length;
        currentSegmentIndex = nextIndex;
        playSegment(musicSegments[nextIndex]);
    }
});

document.getElementById('testVideo').addEventListener('click', () => {
    const url = youtubeUrlInput.value.trim();
    if (url) {
        showLoading('동영상을 테스트하고 있습니다...');
        fetch('/api/test-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                alert('동영상 테스트 성공! 동영상을 처리할 수 있습니다.');
            } else {
                showError('동영상 테스트 실패: ' + data.error);
            }
        })
        .catch(error => {
            hideLoading();
            showError('동영상 테스트 중 오류가 발생했습니다.');
        });
    } else {
        showError('테스트할 YouTube URL을 입력해주세요.');
    }
});

// 초기화
updateMusicSpeed();
updateNonMusicSpeed();
initHistory();
initNavigation(); 