# PRD: Mock 데이터 제거 및 실제 API/DB 연동

## 1. 배경

- 대시보드와 배분 화면이 Mock 데이터에 의존해 실제 자산 데이터와 화면 상태 불일치 발생
- 배분 저장 로직 미구현으로 사용자가 입력한 배분 내역의 DB 반영 불가
- Supabase Repository는 존재하나 화면과 서버 데이터 페칭 계층 미연결

## 2. 목표

- 대시보드와 배분 화면을 Supabase DB 데이터 기반으로 전환
- TanStack Query 기반 hooks로 자산 조회, 배분 저장, 캐시 무효화 처리
- 커스텀 자산 저장과 기존 자산 배분 저장을 하나의 저장 흐름으로 처리

## 3. 범위

### 포함

- TanStack Query 설치 및 Provider 셋업
- 자산 조회용 `useAssets` hook 추가
- 배분 저장용 `useSaveAllocation` hook 추가
- 대시보드 Mock 데이터 제거
- 배분 화면 및 자산 선택 모달 실제 데이터 연동
- `PortfolioList` 타입을 도메인 `Asset` 기준으로 교체
- 자산 잔액 일괄 업데이트용 Supabase RPC 추가 안내

### 제외

- Supabase 프로젝트 생성 또는 인증 구조 변경
- DB 테이블 스키마 전면 개편
- 대시보드 시각 디자인 개편
- 배분 내역 수정/삭제 기능 구현

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-1 | 앱 전역에서 TanStack Query 사용 환경 제공 | `app/_layout.tsx`에 `QueryClientProvider` 적용 |
| REQ-2 | 실제 자산 목록 조회 hook 제공 | `useAssets`가 `assetRepository.getAssets()` 호출 및 로딩/에러/데이터 상태 제공 |
| REQ-3 | 배분 저장 mutation 제공 | `useSaveAllocation`이 배분 항목 저장 및 성공 시 `assets` 쿼리 무효화 |
| REQ-4 | 대시보드에서 Mock 데이터 제거 | `app/(tabs)/index.tsx`가 `useAssets()` 결과로 총자산, 투자 자산, 현금 보유 계산 |
| REQ-5 | 자산 선택 모달에서 실제 자산 사용 | `AssetListContent`가 `MY_ASSETS_DB` 대신 `useAssets()` 결과 사용 |
| REQ-6 | 선택한 자산의 식별자 전달 | `onSelectAsset`과 `onAddAsset` 시그니처가 `assetId` 포함 |
| REQ-7 | 배분 저장 시 기존 자산과 커스텀 자산 처리 | 기존 자산은 `assetId` 사용, 커스텀 자산은 `createAsset()` 후 반환된 `id` 사용 |
| REQ-8 | Supabase에서 자산 잔액 일괄 업데이트 지원 | `bulk_update_asset_balances` RPC를 SQL Editor에서 실행 가능하도록 문서화 |

## 5. 참고 맥락

- 관련 파일:
  - `app/_layout.tsx`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/two.tsx`
  - `components/dashboard/PortfolioList.tsx`
  - `components/allocation/AssetListContent.tsx`
  - `components/allocation/AssetSelectionModal.tsx`
  - `hooks/useAssets.ts`
  - `hooks/useSaveAllocation.ts`
- 관련 Repository:
  - `assetRepository`
  - `allocationRepository`
- 타입 차이:
  - Mock `Asset`: `{ id, name, category, amount, profit, color, icon }`
  - Domain `Asset`: `{ id, userId, name, category, currentBalance, iconName, color, createdAt, updatedAt }`
- 제약/주의사항:
  - `profit` 필드는 도메인 타입에 없으므로 포트폴리오 표시에서 제거
  - `allocationMonth`는 DB DATE 타입과 호환되도록 `YYYY-MM-DD` 포맷으로 저장
  - 자산 잔액 일괄 업데이트는 동시성 문제를 줄이기 위해 DB RPC로 처리

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서 준수

1. TanStack Query 설치 후 `app/_layout.tsx`에 `QueryClientProvider` 추가
2. `hooks/useAssets.ts` 생성 후 `assetRepository.getAssets()` 조회 연결
3. `hooks/useSaveAllocation.ts` 생성 후 배분 저장 mutation과 `assets` 쿼리 무효화 연결
4. `components/dashboard/PortfolioList.tsx`의 props 타입을 도메인 `Asset` 기준으로 교체
5. `app/(tabs)/index.tsx`에서 `DASHBOARD_DATA` 제거 후 `useAssets()` 기반 파생 값 계산
6. `components/allocation/AssetListContent.tsx`에서 `MY_ASSETS_DB` 제거 후 실제 자산 목록 사용
7. `components/allocation/AssetSelectionModal.tsx`와 관련 호출부의 `onAddAsset` 시그니처에 `assetId` 반영
8. `app/(tabs)/two.tsx`에서 `AllocationItem`에 `assetId` 추가 후 `handleSave`에서 `useSaveAllocation` 호출
9. Supabase SQL Editor에서 실행할 `bulk_update_asset_balances` RPC 정리

## 7. 검증

- 대시보드가 Mock 데이터 없이 실제 자산 목록으로 총자산, 투자 자산, 현금 보유 계산
- 자산 선택 모달이 실제 DB 자산 표시 및 선택 시 `assetId` 전달
- 배분 저장 성공 후 `assets` 쿼리 무효화 및 대시보드 데이터 갱신
- 커스텀 자산 저장 시 자산 생성 후 배분 내역 생성
- Supabase RPC 실행 후 자산 잔액 일괄 업데이트 원자적 동작 확인
