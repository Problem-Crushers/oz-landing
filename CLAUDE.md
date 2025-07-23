# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 프로젝트를 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

MusicFlow는 YouTube 영상의 음악 구간을 자동으로 감지하여 배속을 조절해주는 모바일 웹 애플리케이션입니다. 모듈러 모놀리스 아키텍처를 기반으로 구축되었으며, Nx 워크스페이스를 사용하여 프론트엔드와 백엔드를 관리합니다.

## 프로젝트 구조

```
musicflow/
├── apps/
│   ├── web/                    # React PWA (나종한 담당)
│   │   ├── src/
│   │   │   ├── components/     # UI 컴포넌트
│   │   │   ├── pages/          # 라우트 페이지
│   │   │   ├── store/          # Redux 상태 관리
│   │   │   └── utils/          # 유틸리티 함수
│   │   └── vite.config.ts      # Vite 설정
│   └── api/                    # Node.js API (이원호 담당)
│       ├── src/
│       │   ├── controllers/    # 요청 핸들러
│       │   ├── models/         # MongoDB 모델
│       │   ├── routes/         # API 라우트
│       │   └── services/       # 비즈니스 로직
│       └── tsconfig.json       # TypeScript 설정
├── libs/
│   ├── shared/                 # 공유 코드
│   │   ├── types/              # TypeScript 타입 정의
│   │   ├── contracts/          # API 계약
│   │   └── utils/              # 공통 유틸리티
│   ├── player/                 # 플레이어 모듈 (나종한)
│   ├── ui/                     # UI 컴포넌트 라이브러리 (나종한)
│   ├── video-processing/       # 영상 처리 (이원호)
│   └── audio-analysis/         # 오디오 분석 (이원호)
└── tools/                      # 빌드 및 개발 도구
```

## 기술 스택

### Frontend (apps/web)
- **프레임워크**: React 18 + TypeScript
- **상태 관리**: Redux Toolkit
- **스타일링**: Tailwind CSS
- **빌드 도구**: Vite
- **PWA**: vite-plugin-pwa

### Backend (apps/api)
- **런타임**: Node.js + TypeScript
- **프레임워크**: Express
- **데이터베이스**: MongoDB (Mongoose ODM)
- **실시간 통신**: Socket.io
- **영상 처리**: ytdl-core, fluent-ffmpeg

### 개발 도구
- **모노레포**: Nx
- **린팅**: ESLint
- **포맷팅**: Prettier
- **Git 훅**: Husky + lint-staged

## 개발 가이드

### 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정 (backend)
cp apps/api/.env.example apps/api/.env
```

### 개발 명령어
```bash
# 전체 개발 서버 실행
npm run dev

# 개별 앱 실행
npx nx serve web    # 프론트엔드
npx nx serve api    # 백엔드

# 린트
npm run lint

# 테스트
npm run test

# 빌드
npm run build
```

### 모듈 간 의존성 규칙
1. apps는 libs의 모듈을 import할 수 있음
2. libs 모듈 간에는 순환 참조 금지
3. shared 라이브러리는 다른 libs에 의존하지 않음

### 파일 명명 규칙
- 컴포넌트: PascalCase (예: VideoPlayer.tsx)
- 유틸리티: camelCase (예: formatDuration.ts)
- 타입 정의: PascalCase (예: Video.ts)
- 스타일: kebab-case (예: video-player.module.css)

## 주요 기능 구현 위치

### URL 입력 및 다운로드
- Frontend: `apps/web/src/components/UrlInput.tsx`
- Backend: `apps/api/src/controllers/downloadController.ts`

### 비디오 플레이어
- Frontend: `apps/web/src/components/VideoPlayer.tsx`
- 속도 조절: `apps/web/src/components/SpeedControl.tsx`

### 오디오 분석
- Backend: `apps/api/src/controllers/audioController.ts`
- 분석 로직: `libs/audio-analysis/src/`

### 상태 관리
- Redux Store: `apps/web/src/store/`
- Slices: videoSlice, playerSlice, downloadSlice

## 협업 가이드

### 모듈 소유권
- **나종한**: apps/web, libs/player, libs/ui
- **이원호**: apps/api, libs/video-processing, libs/audio-analysis
- **공동**: libs/shared

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

### PR 규칙
1. develop 브랜치로 PR 생성
2. 상대방 리뷰 필수
3. CI 통과 필수
4. 스쿼시 머지 사용

## 주의사항

1. **YouTube 다운로드**: 개인 사용 목적으로만 제한
2. **파일 저장**: 로컬 저장소 관리 필요
3. **오디오 분석**: 현재 임시 알고리즘 사용 중
4. **모바일 최적화**: 터치 제스처 및 반응형 디자인 필수

## 향후 개발 계획

1. 실제 오디오 분석 알고리즘 구현
2. 하이브리드 앱 패키징 (React Native or Cordova)
3. 클라우드 스토리지 연동
4. 소셜 공유 기능