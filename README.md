# MusicFlow - 스마트한 유튜브 시청 경험

> 음악이 흐르면 자연스럽게 속도도 흐른다

MusicFlow는 YouTube 영상의 음악 구간을 자동으로 감지하여 배속을 조절해주는 모바일 웹 애플리케이션입니다.

## 🚀 주요 기능

- **YouTube 영상 다운로드**: URL 입력만으로 영상을 로컬에 저장
- **자동 배속 조절**: 음악 구간은 1배속, 나머지는 사용자 설정 배속으로 자동 전환
- **오프라인 재생**: 다운로드한 영상을 데이터 없이 시청
- **PWA 지원**: 앱처럼 설치하여 사용 가능

## 🏗️ 프로젝트 구조

모듈러 모놀리스 아키텍처 기반의 Nx 워크스페이스로 구성되어 있습니다.

```
musicflow/
├── apps/
│   ├── web/          # React PWA 프론트엔드
│   └── api/          # Node.js 백엔드 API
├── libs/
│   ├── shared/       # 공유 타입, 계약, 유틸리티
│   ├── player/       # 비디오 플레이어 모듈
│   ├── ui/           # UI 컴포넌트 라이브러리
│   ├── video-processing/  # 영상 처리 모듈
│   └── audio-analysis/    # 오디오 분석 모듈
└── tools/            # 빌드 도구 및 스크립트
```

## 🛠️ 기술 스택

### Frontend
- React 18 + TypeScript
- Redux Toolkit (상태 관리)
- Vite (빌드 도구)
- Tailwind CSS (스타일링)
- PWA (Progressive Web App)

### Backend
- Node.js + Express
- TypeScript
- MongoDB (데이터베이스)
- Socket.io (실시간 통신)
- FFmpeg (오디오 분석)
- ytdl-core (YouTube 다운로드)

### DevOps
- Nx (모노레포 관리)
- ESLint + Prettier (코드 품질)
- Husky + lint-staged (Git 훅)
- GitHub Actions (CI/CD)

## 🚦 시작하기

### 사전 요구사항
- Node.js 20.x 이상
- npm 10.x 이상
- MongoDB
- FFmpeg

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp apps/api/.env.example apps/api/.env
# .env 파일을 열어 필요한 값들을 설정
```

3. 개발 서버 실행
```bash
npm run dev
```

이 명령어는 프론트엔드(http://localhost:3000)와 백엔드(http://localhost:3001)를 동시에 실행합니다.

### 개별 실행

```bash
# 프론트엔드만
npx nx serve web

# 백엔드만
npx nx serve api
```

## 📝 개발 가이드

### 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드, 패키지 매니저 등
```

### 주요 명령어

```bash
# 린트 실행
npm run lint

# 테스트 실행
npm run test

# 빌드
npm run build

# 포맷팅
npm run format
```

## 👥 팀원

- **나종한** (팀장): React 프론트엔드, PWA 구현, 프로젝트 관리
- **이원호**: Node.js 백엔드, 영상 다운로드 서버, 오디오 분석 알고리즘
- **심은정**: 모바일 UI/UX 설계, 사용자 테스트, 랜딩페이지 콘텐츠

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.