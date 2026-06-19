# PRD: Supabase Auth/RLS 기반 추가

## 1. 배경

- 웹 URL 배포 시 Supabase anon key 노출 전제
- 클라이언트의 Supabase API 직접 접근 가능성 존재
- `assets`, `allocations` 데이터의 사용자별 접근 제한 필요
- 현재 일부 타입과 매퍼에 `user_id` 반영
- RLS 정책과 DB 레벨 보호 미구성
- 배분 저장 흐름에서 자산 생성, 배분 생성/수정/삭제, 자산 잔액 갱신이 함께 발생
- 클라이언트가 전달하는 `assetId`, `allocationId`, `userId` 신뢰 금지

## 2. 목표

- `assets`, `allocations` 데이터를 로그인 사용자 기준으로 분리
- Supabase RLS 정책으로 직접 API 접근까지 보호
- 신규 데이터 생성 시 로그인 사용자 ID 연결
- 기존 RPC가 다른 사용자의 자산을 변경하지 못하도록 제한
- 배분 데이터가 현재 사용자 소유 자산만 참조하도록 제한
- 로그인/로그아웃/계정 전환 시 이전 사용자 캐시 노출 방지
- REQ-2 로그인 화면과 세션 처리 작업 전 필요한 DB/Auth 기반 마련

## 3. 범위

### 포함

- `assets`, `allocations` 테이블의 `user_id` 컬럼 보장
- `user_id`와 `auth.users(id)` 외래 키 연결
- `assets`, `allocations` RLS 활성화
- 로그인 사용자 기준 select/insert/update/delete 정책 추가
- 신규 insert 시 `user_id = auth.uid()` 기준 검증
- `allocations.asset_id`가 현재 사용자 소유 `assets.id`인지 검증
- `bulk_update_assets` RPC 사용자 범위 제한
- `bulk_update_asset_balances` RPC 존재 여부 확인 및 사용자 범위 제한
- `saveAllocations` 경로의 `assetId`, `allocationId` 소유자 검증 지점 정리
- React Query 데이터 캐시의 사용자별 격리 처리
- 세션 변경 시 `assets`, `allocations` 캐시 초기화 또는 사용자별 query key 적용
- 기존 데이터 마이그레이션 전략 정리
- 관련 타입, 매퍼, 레포지토리의 사용자 식별 흐름 점검

### 제외

- 로그인 화면 구현
- 세션 기반 라우팅 처리
- 웹 전용 레이아웃 구현
- 대시보드, 배분, 내역 화면 UX 개편
- Supabase 외 백엔드 전환
- 공개 배포 설정

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-1-1 | `assets`, `allocations` 사용자 식별 컬럼 보장 | 두 테이블에 `user_id` 컬럼 존재 및 `auth.users(id)` 연결 |
| REQ-1-2 | RLS 활성화 | 두 테이블에 Row Level Security 활성화 |
| REQ-1-3 | `assets` 사용자별 CRUD 제한 | 로그인 사용자는 본인 `user_id` 자산만 조회/생성/수정/삭제 가능 |
| REQ-1-4 | `allocations` 사용자별 CRUD 제한 | 로그인 사용자는 본인 `user_id` 배분만 조회/생성/수정/삭제 가능 |
| REQ-1-5 | 배분 자산 참조 제한 | `allocations.asset_id`는 현재 사용자 소유 `assets.id`만 참조 가능 |
| REQ-1-6 | 신규 데이터 소유자 강제 | 클라이언트가 다른 `user_id`를 보내도 `auth.uid()`와 일치하지 않으면 실패 |
| REQ-1-7 | `bulk_update_assets` 사용자 범위 제한 | 본인 소유 자산만 갱신 및 반환 |
| REQ-1-8 | `bulk_update_asset_balances` 사용자 범위 확인 | 함수 존재 여부 확인 후 본인 소유 자산만 갱신하도록 보장 |
| REQ-1-9 | 저장 서비스 경계 점검 | `saveAllocations`에서 쓰는 `assetId`, `allocationId`가 RLS/RPC에서 최종 차단됨 |
| REQ-1-10 | 기존 데이터 처리 전략 정리 | 기존 `user_id` 없는 데이터 처리 방식 명시 |
| REQ-1-11 | React Query 캐시 사용자별 격리 | 로그인/로그아웃/계정 전환 시 이전 사용자 `assets`, `allocations` 캐시가 노출되지 않음 |

## 5. 참고 맥락

- 관련 파일:
  - `lib/supabase.ts`
  - `types/database/asset-row.ts`
  - `types/database/allocation-row.ts`
  - `types/domain/asset.ts`
  - `types/domain/allocation.ts`
  - `services/mapper/assetMapper.ts`
  - `services/mapper/allocationMapper.ts`
  - `repositories/asset.repository.ts`
  - `repositories/allocation.repository.ts`
  - `hooks/useAssets.ts`
  - `hooks/useAllocations.ts`
  - `hooks/useSaveAllocation.ts`
  - `hooks/useUpdateAssets.ts`
  - `services/allocation/allocation.service.ts`
  - `services/asset/asset.service.ts`
  - `supabase/migrations/20260319000000_bulk_update_assets.sql`
- 사용자 검증 필요 경로:
  - `assetRepository.getAssets`
  - `assetRepository.getAssetById`
  - `assetRepository.createAsset`
  - `assetRepository.updateAsset`
  - `assetRepository.deleteAsset`
  - `assetRepository.bulkUpdateAssets`
  - `assetRepository.bulkUpdateBalance`
  - `allocationRepository.getAllocations`
  - `allocationRepository.getAllocationById`
  - `allocationRepository.createAllocation`
  - `allocationRepository.bulkCreateAllocation`
  - `allocationRepository.updateAllocation`
  - `allocationRepository.deleteAllocation`
  - `saveAllocations`
- 캐시 격리 필요 경로:
  - `useAssets` query key `['assets']`
  - `useAllocations` query key `['allocations']`
  - `useUpdateAssets` optimistic cache update `['assets']`
  - `useSaveAllocation` mutation success invalidation `['assets']`, `['allocations']`
- 데이터 흐름:
  - `useAssets` → `assetRepository.getAssets`
  - `useAllocations` → `allocationRepository.getAllocations`
  - `useUpdateAssets` → `assetRepository.bulkUpdateAssets`
  - `useSaveAllocation` → `saveAllocations`
  - `saveAllocations` → `assetRepository.createAsset`
  - `saveAllocations` → `allocationRepository.createAllocation`
  - `saveAllocations` → `allocationRepository.updateAllocation`
  - `saveAllocations` → `allocationRepository.deleteAllocation`
  - `saveAllocations` → `assetRepository.bulkUpdateBalance`
- 제약/주의사항:
  - Supabase anon key 노출은 정상 구조로 취급
  - 데이터 보호는 반드시 RLS 기준으로 처리
  - 클라이언트 쿼리 조건만으로 사용자 격리 보장 금지
  - 클라이언트에서 전달되는 `userId`, `assetId`, `allocationId` 신뢰 금지
  - `allocation.user_id = auth.uid()`만으로는 부족하며 `allocation.asset_id`의 소유자도 확인 필요
  - 기존 데이터의 소유자 지정 방식은 적용 전 사용자 확인 필요
  - REQ-2 전까지 UI 로그인 흐름 구현 제외
  - 캐시 격리는 로그인 UI 없이도 세션 변경 이벤트 또는 현재 사용자 식별 hook 기준으로 처리

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서를 따릅니다.

1. 현재 `assets`, `allocations` 스키마와 코드의 `user_id` 반영 상태 확인
2. `user_id` 컬럼, 외래 키, 인덱스 보강 필요 여부 확인
3. 기존 `user_id` 없는 데이터 처리 방식 사용자 확인
4. `assets`, `allocations` RLS 활성화 마이그레이션 작성
5. `assets` select/insert/update/delete 정책 작성
6. `allocations` select/insert/update/delete 정책 작성
7. `allocations.asset_id`가 현재 사용자 소유 자산인지 검증하는 정책 작성
8. `bulk_update_assets` RPC에 `auth.uid()` 기준 소유자 제한 추가
9. `bulk_update_asset_balances` RPC 정의 위치와 원격 존재 여부 확인
10. `bulk_update_asset_balances` RPC가 존재하면 `auth.uid()` 기준 소유자 제한 추가
11. `assetRepository`, `allocationRepository`, `saveAllocations`에서 클라이언트 `userId` 신뢰 지점 제거 여부 점검
12. `useAssets`, `useAllocations` query key 사용자별 격리 방식 결정
13. `useUpdateAssets`, `useSaveAllocation`의 cache update/invalidation key 정합성 반영
14. 로그인/로그아웃/계정 전환 시 `assets`, `allocations` 캐시 초기화 필요 여부 점검
15. Supabase SQL 기준 자체 검증

## 7. 검증

- `assets` RLS 활성화 여부 확인
- `allocations` RLS 활성화 여부 확인
- 사용자 A가 사용자 B의 `assets` 조회 불가 확인
- 사용자 A가 사용자 B의 `allocations` 조회 불가 확인
- 사용자 A가 사용자 B의 `assets` 생성/수정/삭제 불가 확인
- 사용자 A가 사용자 B의 `allocations` 생성/수정/삭제 불가 확인
- 사용자 A가 사용자 B의 `asset_id`로 `allocations` 생성 불가 확인
- 사용자 A가 사용자 B의 `asset_id`로 `allocations` 수정 불가 확인
- 클라이언트가 사용자 B의 `user_id`를 보내도 insert/update 실패 확인
- `bulk_update_assets`가 본인 소유 자산만 갱신 및 반환하는지 확인
- `bulk_update_asset_balances`가 존재하면 본인 소유 자산만 갱신하는지 확인
- 미로그인 요청에서 보호 데이터 접근 불가 확인
- 마이그레이션 SQL 문법 오류 없음 확인
- 사용자 A 로그인 후 사용자 B로 계정 전환 시 사용자 A의 `assets` 캐시 미노출 확인
- 사용자 A 로그인 후 사용자 B로 계정 전환 시 사용자 A의 `allocations` 캐시 미노출 확인
- `useUpdateAssets`, `useSaveAllocation` mutation 이후 사용자별 query key 또는 캐시 초기화 전략 유지 확인
