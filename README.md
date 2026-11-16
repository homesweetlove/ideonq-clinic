# IDEONQ Clinic — Public Showcase

[한국어](#한국어) | [English](#english)

[**▶ 웹에서 인터랙티브 데모 체험하기**](https://ideonq-clinic.vercel.app)

> **Public demonstration only.** Every person, record, schedule, clinic, and event shown here is invented. This repository contains **no production backend, real health records, authentication system, database schema, credentials, or deployment configuration.**

## 한국어

IDEONQ Clinic의 제품 방향과 화면 흐름을 소개하는 **독립형 정적 웹 데모**입니다. 실제 의료기관 운영 시스템을 공개하거나 실환자 정보를 사용하는 프로젝트가 아닙니다.

### 미리 보기

- 접수 현황과 대기열
- 예약 및 진료실 일정
- 가상 차트와 초안 화면
- 직원 운영 체크리스트
- 관리자·의사·접수 역할 전환 *UI 시뮬레이션*
- **4단계 가이드 데모** — 가상 접수 생성 → 호출 → 가상 차트 확인 → 완료
- 화면 크기에 대응하는 반응형 레이아웃, 상세 패널, 상태 전환 모션

모든 조작은 브라우저 메모리에서만 이루어지며 새로고침 시 초기화됩니다. 서버 요청, 쿠키, 로컬 저장소, 계정 로그인, 분석 도구가 없습니다. 역할 전환은 **보안 권한 구현이 아닌 UI 시뮬레이션**입니다.

### 실행

Node.js 20 이상:

```bash
npm run serve
```

브라우저에서 `http://127.0.0.1:4173`에 접속합니다. 데모 파일만 확인하려면 `demo/index.html`을 정적 웹 서버로 제공해도 됩니다. 외부 패키지를 설치하지 않습니다.

### 테스트

```bash
npm test
```

### 프로젝트 범위

| 포함 | 포함하지 않음 |
| --- | --- |
| 독립형 HTML/CSS/JavaScript UI | 원본 비공개 Flutter 앱 전체 코드 |
| 합성 데이터와 로컬 상호작용 | 인증·인가, 의료정보 암호화 구현 |
| 화면 흐름과 기술 문서 | API 서버, PostgreSQL, 마이그레이션 |
| 자동 테스트, 정적 파일 | 백업·복구, 운영 인프라, 비밀값 |

이 데모는 제품의 **업무 흐름과 인터페이스를 설명하기 위한 축약본**입니다. 실제 진료기록 작성, 개인정보 처리, 의료기관 운영, 보안 수준 증명 또는 실서비스 배포에 사용하면 안 됩니다.

공개/비공개 분리 원칙은 [공개 범위](docs/PUBLIC-SCOPE.md), 단순화한 구조는 [아키텍처](docs/ARCHITECTURE.md)를 참고하세요.
아이콘의 라이선스 고지는 [THIRD_PARTY.md](THIRD_PARTY.md)에 있습니다.

## English

IDEONQ Clinic Public Showcase is a **standalone, offline, synthetic-data UI demo** illustrating reception, appointments, sample chart views, and staff operations.

**[Launch the interactive web demo](https://ideonq-clinic.vercel.app)** — includes a four-step guided workflow, responsive layout, and synthetic chart drawer.

- No API calls, sign-in, cookies, analytics, browser storage, or external dependencies.
- All sample patients, appointments and clinic names are explicitly fictional.
- Changes remain in memory and are reset on refresh.
- Switching roles only changes the demonstration UI; it does not implement authorization.
- The private clinical backend, source history, database migrations, credentials, and operations configuration are **not included**.

Run `npm run serve`, open `http://127.0.0.1:4173`, and run `npm test` for the local test suite (Node.js 20+).

**Not a medical device, electronic health record system, or production-ready clinic solution.** Do not use it with patient data or for clinical decisions.

### License

The code in **this showcase repository only** is available under the [MIT License](LICENSE). The IDEONQ name and identifying marks are not granted as trademarks. This license does not cover any separate private IDEONQ repositories or third-party code.
