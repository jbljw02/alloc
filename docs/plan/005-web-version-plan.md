# PRD: Expo Web 기반 웹 버전 구현

## 1. 배경

- 현재 앱은 Expo/React Native 기반으로 구현되어 있으며 모바일 중심 화면 구조 사용
- 자산 관리 기능을 브라우저에서도 사용할 수 있도록 웹 버전 필요
- 기존 백엔드 연동, 도메인 로직, 유틸리티를 유지하면서 웹 화면 계층 중심으로 확장 필요
- 웹 URL 배포 시 인증과 사용자별 데이터 접근 제어 필요

## 2. 목표

- 현재 리포지토리 안에서 Expo Web 기반 웹 버전 구현
- 기존 `services`, `repositories`, `hooks`, `utils`, `types` 재사용
- 모바일 앱 화면을 단순히 웹에 축소 표시하지 않고 데스크톱 웹앱에 맞는 레이아웃 제공
- 웹 URL로 배포 가능한 상태까지 필요한 기반 정리
- 웹 공개 전 Supabase Auth와 RLS 기반 사용자별 데이터 보호 구조 마련

## 3. 범위

### 포함

- Expo Web 실행 기반 확인 및 웹 호환성 정리
- Supabase Auth, 이메일/비밀번호 로그인 기능, 세션 처리, RLS 정책 적용 계획 수립
- 웹 전용 레이아웃 구조 추가
- 모바일 하단 탭과 구분되는 웹 네비게이션 구조 검토
- 대시보드, 배분, 내역 화면의 웹 UX 개선
- 모바일 중심 `Alert`, `Modal`, `SafeAreaView` 의존 UI의 웹 대응
- 웹 배포 준비와 환경변수 정리
- PR 단위 작업 분리

### 제외

- 별도 웹 전용 리포지토리 생성
- 기존 모바일 앱 기능 전면 재작성
- Next.js 기반 SSR/SEO 웹사이트 전환
- 공개 랜딩 페이지 제작
- 디자인 시스템 전면 개편
- Supabase 외 백엔드로 전환

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-1 | Supabase Auth/RLS 기반 추가 | `assets`, `allocations` 데이터가 로그인 사용자 기준으로 분리되고 RLS 정책으로 보호 |
| REQ-2 | 앱 로그인 기능 추가 및 세션 처리 | 이메일/비밀번호 로그인이 동작하고 미로그인 사용자는 로그인 화면으로 이동하며 로그인 사용자는 앱 화면 접근 |
| REQ-3 | Expo Web 실행 기반과 웹 레이아웃 뼈대 추가 | 같은 리포지토리에서 웹 실행 가능하고 웹 전용 네비게이션과 기본 레이아웃 제공 |
| REQ-4 | 대시보드 웹 UX 개선 | 자산 요약, 차트, 포트폴리오 리스트가 데스크톱 화면에 맞게 배치 |
| REQ-5 | 배분 웹 UX 개선 | 수입 입력, 자산 선택, 금액 입력, 저장 흐름이 웹 입력 UX에 맞게 동작 |
| REQ-6 | 내역 웹 UX 개선 | 월 이동, 필터, 카테고리 요약, 내역 편집이 웹 화면에서 자연스럽게 동작 |
| REQ-7 | 웹 배포 준비 | 웹 export/build 결과물을 호스팅 서비스에 배포할 수 있도록 설정과 환경변수 정리 |

## 5. 참고 맥락

- 관련 파일:
  - `package.json`
  - `app/_layout.tsx`
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/allocation.tsx`
  - `app/(tabs)/history.tsx`
  - `lib/supabase.ts`
  - `hooks/useAssets.ts`
  - `hooks/useAllocations.ts`
  - `hooks/useSaveAllocation.ts`
  - `services/asset/asset.service.ts`
  - `services/allocation/allocation.service.ts`
  - `repositories/asset.repository.ts`
  - `repositories/allocation.repository.ts`
- 현재 구조:

| 계층 | 현재 역할 | 웹 버전 방향 |
| --- | --- | --- |
| App Route | Expo Router 기반 모바일 탭 화면 | 웹 레이아웃과 네비게이션 추가 |
| Components | React Native UI 컴포넌트 | 공용 컴포넌트 유지 또는 웹 전용 컴포넌트 분리 |
| Hooks | React Query 데이터 연결 | 유지 |
| Services | 도메인 계산과 저장 규칙 | 유지 |
| Repositories | Supabase CRUD | 사용자별 데이터 조건 추가 |
| Utils/Types | 포맷팅, 검증, 타입 | 유지 |

- 인증 및 권한 고려사항:
  - 웹 배포 시 Supabase anon key 노출은 정상 구조이나 RLS 필수
  - `assets`, `allocations`에 사용자 식별 컬럼 추가 필요
  - 기존 데이터 마이그레이션 전략 필요
  - 로그인 없는 공개 배포 금지

- PR 분리 기준:

| PR | 목적 |
| --- | --- |
| PR 1 | REQ-1 Supabase Auth/RLS 기반 추가 |
| PR 2 | REQ-2 앱 로그인 기능 추가 및 세션 처리 |
| PR 3 | REQ-3 Expo Web 실행 기반과 웹 레이아웃 뼈대 추가 |
| PR 4 | REQ-4 대시보드 웹 UX 개선 |
| PR 5 | REQ-5 배분 웹 UX 개선 |
| PR 6 | REQ-6 내역 웹 UX 개선 |
| PR 7 | REQ-7 웹 배포 준비 |

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서 준수

1. Supabase Auth/RLS 기반 추가
2. 앱 로그인 기능 추가 및 세션 처리
3. Expo Web 실행 기반과 웹 레이아웃 뼈대 추가
4. 대시보드 웹 UX 개선
5. 배분 웹 UX 개선
6. 내역 웹 UX 개선
7. 웹 배포 준비

## 7. 검증

- `npm run web`으로 웹 앱 실행 확인
- 모바일 앱 라우팅과 주요 화면 회귀 확인
- 이메일/비밀번호 로그인 성공 확인
- 잘못된 로그인 정보 입력 시 오류 표시 확인
- 미로그인 상태에서 보호 화면 접근 차단 확인
- 로그인 상태에서 대시보드, 배분, 내역 화면 접근 확인
- 사용자 A와 사용자 B의 자산 및 배분 데이터가 분리되는지 확인
- Supabase RLS가 직접 API 접근에도 사용자별 접근 제한을 적용하는지 확인
- 대시보드, 배분, 내역 화면이 데스크톱 너비에서 웹앱 레이아웃으로 표시되는지 확인
- 웹용 피드백 UI가 저장 성공, 저장 실패, 유효성 오류 상태를 표시하는지 확인
- 웹 export/build 결과물이 생성되는지 확인
- 배포 환경변수 누락 시 오류 원인이 확인 가능하게 드러나는지 확인
