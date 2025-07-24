# YouTube 음악 플레이어

YouTube 동영상에서 노래가 나오지 않는 부분을 건너뛰거나 배속을 빠르게 하고, 노래 부분만 정상 속도로 재생하는 웹 애플리케이션입니다.

## 주요 기능

- 🎵 **음악 감지**: FFmpeg를 사용하여 동영상에서 음악 구간을 자동으로 감지
- ⏭️ **스마트 건너뛰기**: 노래가 없는 부분을 자동으로 건너뛰기
- ⚡ **배속 조절**: 노래가 없는 부분은 빠른 속도로, 노래 부분은 정상 속도로 재생
- 🎮 **직관적인 컨트롤**: 음악 부분만 재생, 다음 음악으로 건너뛰기 등 다양한 재생 옵션
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능

## 설치 및 실행

### 필수 요구사항

- Node.js (v14 이상)
- FFmpeg (시스템에 설치되어 있어야 함)

### FFmpeg 설치

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS:
```bash
brew install ffmpeg
```

#### Windows:
[FFmpeg 공식 사이트](https://ffmpeg.org/download.html)에서 다운로드

### 프로젝트 설치

1. 의존성 설치:
```bash
npm install
```

2. 서버 실행:
```bash
npm start
```

3. 개발 모드로 실행 (자동 재시작):
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 사용법

1. **YouTube URL 입력**: 동영상 URL을 입력하고 "동영상 로드" 버튼 클릭
2. **설정 조정**: 
   - 노래가 없는 부분 건너뛰기 여부
   - 노래 부분 재생 속도 (0.5x ~ 2.0x)
   - 노래가 없는 부분 재생 속도 (1.0x ~ 5.0x)
3. **동영상 처리**: "동영상 처리 및 재생" 버튼 클릭
4. **재생 제어**:
   - **음악 부분만 재생**: 감지된 음악 구간만 재생
   - **전체 재생**: 전체 동영상을 정상 속도로 재생
   - **다음 음악으로 건너뛰기**: 다음 음악 구간으로 이동

## 기술 스택

- **백엔드**: Node.js, Express.js, Socket.IO
- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **동영상 처리**: ytdl-core, fluent-ffmpeg
- **음악 감지**: FFmpeg silencedetect 필터

## 프로젝트 구조

```
youtube/
├── server.js              # Express 서버
├── package.json           # 프로젝트 의존성
├── README.md             # 프로젝트 설명
├── public/               # 정적 파일
│   ├── index.html        # 메인 페이지
│   ├── style.css         # 스타일시트
│   └── script.js         # 클라이언트 JavaScript
└── temp/                 # 임시 파일 (자동 생성)
```

## API 엔드포인트

- `POST /api/video-info`: YouTube 동영상 정보 가져오기
- `POST /api/process-video`: 동영상 처리 및 음악 감지
- `GET /api/video/:videoId`: 처리된 동영상 스트리밍

## 음악 감지 알고리즘

이 애플리케이션은 FFmpeg의 `silencedetect` 필터를 사용하여 음악을 감지합니다:

1. **무음 감지**: -50dB 이하의 소리를 무음으로 판단
2. **구간 분할**: 무음과 음악 구간을 시간별로 분할
3. **재생 속도 조절**: 구간 타입에 따라 다른 재생 속도 적용

## 주의사항

- YouTube의 이용약관을 준수하여 사용하세요
- 저작권이 있는 콘텐츠는 적절한 권한을 얻은 후 사용하세요
- 대용량 동영상 처리 시 시간이 오래 걸릴 수 있습니다

## 라이선스

MIT License

## 기여하기

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요. 