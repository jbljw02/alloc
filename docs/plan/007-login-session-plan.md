# PRD: Google 로그인 기능 및 세션 처리

## 1. 배경

- 웹 버전 공개 전 미로그인 사용자의 앱 데이터 접근 차단 필요
- Supabase Auth/RLS 기반은 마련되었으나 사용자가 로그인할 수 있는 화면 부재
- 현재 앱 라우팅은 탭 화면 중심이며 세션 상태에 따른 접근 제어 미구성
- 이메일/비밀번호 기반 회원가입, 이메일 인증, 비밀번호 재설정 흐름 없이 빠르게 사용할 수 있는 소셜 로그인 필요
- React Query 캐시는 사용자별 query key와 세션 변경 동기화 기반이 있으나 로그인/로그아웃 흐름과 연결 필요

## 2. 목표

- Supabase Auth 기반 Google 소셜 로그인 기능 구현
- 미로그인 사용자는 로그인 화면으로 이동
- 로그인 사용자는 대시보드, 배분, 내역 화면 접근 가능
- 앱 시작 시 Supabase 세션을 확인하고 로딩 상태를 안정적으로 처리
- 로그인, 로그아웃, 계정 전환 시 이전 사용자 데이터 노출 방지
- 모바일과 웹에서 공통으로 동작하는 인증 흐름 마련

## 3. 범위

### 포함

- 로그인 화면 라우트 추가
- Google 소셜 로그인 UI 추가
- Supabase Auth OAuth 로그인 요청 처리
- 웹과 모바일의 OAuth 리다이렉트 URL 처리
- 앱 시작 시 세션 확인 및 인증 상태 관리
- 미로그인 사용자의 보호 화면 접근 차단
- 로그인 사용자의 로그인 화면 접근 시 앱 화면으로 이동
- 로그아웃 진입점 추가
- 로그인/로그아웃 처리 중 로딩 상태 표시
- 로그인 실패와 세션 확인 실패 오류 표시
- 세션 변경 시 React Query 캐시 정합성 점검

### 제외

- 이메일/비밀번호 로그인 구현
- 회원가입 화면 구현
- 비밀번호 재설정 구현
- Google 외 소셜 로그인 구현
- Supabase RLS 정책 추가 변경
- 웹 전용 레이아웃 구현
- 대시보드, 배분, 내역 화면 UX 개편
- 공개 배포 설정
- 사용자 프로필 관리 기능

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-2-1 | 로그인 화면 추가 | `/login` 라우트에서 Google 로그인 실행 가능 |
| REQ-2-2 | Supabase Auth Google OAuth 처리 | Google 계정으로 로그인하면 Supabase 세션이 생성되고 앱 화면으로 이동 |
| REQ-2-3 | 앱 시작 시 세션 확인 | 앱 초기 진입 시 기존 세션 유무를 확인하고 확인 전 보호 화면을 노출하지 않음 |
| REQ-2-4 | 보호 라우팅 적용 | 미로그인 사용자가 `(tabs)` 화면에 접근하면 로그인 화면으로 이동 |
| REQ-2-5 | 로그인 사용자 리다이렉트 | 로그인 사용자가 `/login`에 접근하면 기본 앱 화면으로 이동 |
| REQ-2-6 | 로그아웃 처리 | 앱 화면에서 로그아웃을 실행하면 Supabase 세션이 제거되고 로그인 화면으로 이동 |
| REQ-2-7 | 인증 로딩 상태 | 세션 확인, 로그인, 로그아웃 진행 중 중복 입력과 잘못된 화면 깜빡임 방지 |
| REQ-2-8 | 인증 오류 표시 | Google 로그인 실패, 취소, 세션 처리 실패 시 사용자가 이해할 수 있는 상태 표시 |
| REQ-2-9 | 캐시 노출 방지 | 로그아웃 또는 계정 전환 후 이전 사용자의 `assets`, `allocations` 데이터가 화면에 남지 않음 |
| REQ-2-10 | 모바일/웹 공통 동작 | iOS, Android, Web에서 동일한 인증 흐름으로 앱 접근 제어 가능 |
| REQ-2-11 | OAuth 설정 문서화 | Supabase와 Google OAuth에 필요한 리다이렉트 URL과 환경 설정 항목 정리 |

## 5. 참고 맥락

- 관련 파일:
  - `app/_layout.tsx`
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/allocation.tsx`
  - `app/(tabs)/history.tsx`
  - `lib/supabase.ts`
  - `app.json`
  - `components/auth/AuthCacheSync.tsx`
  - `hooks/useAuthUserId.ts`
  - `hooks/useAssets.ts`
  - `hooks/useAllocations.ts`
  - `hooks/useSaveAllocation.ts`
  - `hooks/useUpdateAssets.ts`
  - `utils/validators.ts`
- 선행 문서:
  - `docs/plan/005-web-version-plan.md`
  - `docs/plan/006-supabase-auth-rls-plan.md`
- 현재 상태:
  - `AuthCacheSync`가 Supabase 세션 변경 이벤트를 React Query 캐시에 반영
  - `useAuthUserId`가 현재 세션의 사용자 ID를 조회
  - `useAssets`, `useAllocations`는 사용자 ID가 있을 때만 데이터 조회
  - 로그인 화면과 보호 라우팅은 아직 없음
- 제약/주의사항:
  - 인증 상태는 클라이언트 UI 보호용이며 데이터 보호의 최종 기준은 Supabase RLS
  - Supabase Google Provider와 Google Cloud OAuth Client 설정 필요
  - 웹 redirect URL과 Expo 앱 redirect URL을 환경별로 구분
  - 세션 확인 전에는 보호 화면 데이터를 렌더링하지 않도록 처리
  - `useEffect` 사용은 라우팅과 외부 세션 구독처럼 필요한 경우에만 제한
  - `Alert` 의존은 웹 UX에서 어색할 수 있으므로 화면 내 오류 표시 우선
  - 앱 전역 인증 상태와 React Query 캐시가 서로 다른 사용자 상태를 보여주지 않도록 주의

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서를 따릅니다.

1. 현재 라우트 구조와 세션 관련 훅의 동작 확인
2. Supabase Google Provider, Google OAuth Client, 리다이렉트 URL 설정 항목 정리
3. 인증 상태를 읽는 공용 훅 또는 기존 `useAuthUserId` 확장 필요 여부 결정
4. OAuth redirect URL 생성 방식과 웹/모바일 분기 필요 여부 결정
5. `/login` 라우트와 로그인 화면 컴포넌트 추가
6. Google 로그인 제출 핸들러, 진행 상태, 취소/오류 메시지 처리 구현
7. 앱 루트 또는 라우트 그룹에서 세션 확인 로딩 상태 처리
8. 미로그인 사용자의 `(tabs)` 접근을 `/login`으로 이동 처리
9. 로그인 사용자의 `/login` 접근을 기본 탭 화면으로 이동 처리
10. 앱 화면에서 로그아웃을 실행할 수 있는 진입점 추가
11. 로그아웃 성공 시 세션 제거, 캐시 정리, 로그인 화면 이동 흐름 확인
12. 계정 전환 시 기존 사용자 데이터가 노출되지 않는지 `AuthCacheSync`와 query key 정합성 점검
13. 모바일과 웹에서 인증 화면, 보호 라우팅, 로그아웃 흐름 자체 검증

## 7. 검증

- 미로그인 상태로 앱 시작 시 로그인 화면 표시 확인
- 미로그인 상태로 대시보드, 배분, 내역 URL 직접 접근 시 로그인 화면 이동 확인
- Google 로그인 버튼 실행 시 Supabase OAuth 흐름 시작 확인
- Google 로그인 취소 또는 실패 시 상태 표시 확인
- Google 로그인 성공 시 대시보드 접근 확인
- 로그인 상태로 `/login` 접근 시 기본 앱 화면 이동 확인
- 앱 재시작 또는 새로고침 후 기존 세션 유지 확인
- 로그아웃 실행 시 로그인 화면 이동 확인
- 로그아웃 직후 이전 사용자의 자산과 배분 데이터 미노출 확인
- 사용자 A 로그인 후 로그아웃, 사용자 B 로그인 시 사용자 A 캐시 미노출 확인
- 세션 확인 중 보호 화면이 먼저 깜빡이며 표시되지 않는지 확인
- `npm test` 실행으로 기존 서비스/유틸 테스트 회귀 확인
- `npm run web` 실행 후 웹 인증 흐름 수동 확인
