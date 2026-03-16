# 자산 스냅샷 도입 계획

## 개요

대시보드의 `총 자산 전월 대비`를 실제 월 기준 데이터로 계산할 수 있도록
`asset_snapshots` 구조를 도입한다.

현재 프로젝트는 `assets.current_balance`에 현재 잔액만 유지한다.
이 구조만으로는 지난달 총자산, 지난달 카테고리 합계, 자산별 월간 변화를 정확히 복원할 수 없다.

`allocations`는 자금 흐름 데이터이므로
`총자산 전월 대비` 지표의 근거 데이터로 직접 사용하지 않는다.

---

## 현재 상태

| 영역 | 현재 동작 | 한계 |
|---|---|---|
| `assets` | 현재 자산 잔액 보관 | 과거 월 기준 잔액 복원 불가 |
| `allocations` | 월별 배분 입력 보관 | 자금 흐름만 표현, 평가손익/외부 변동 반영 불가 |
| 대시보드 | 현재 총자산/카테고리 합계 계산 | 전월 총자산 비교를 정확히 계산할 근거 없음 |
| 내역 페이지 | 월별 배분 흐름 비교 | 총자산 비교와 의미가 다름 |

---

## 왜 `asset_snapshots`를 선택하는가

`portfolio_snapshots`는 총합 대시보드만 빠르게 해결하는 데에는 유효하다.
다만 현재 프로젝트는 이미 자산 단위 구조를 중심으로 설계되어 있다.

- `assets` 테이블이 자산명, 카테고리, 색상, 아이콘을 개별 관리
- 대시보드가 총합만 아니라 자산 리스트와 카테고리 합계를 함께 사용
- 배분 데이터가 `assetId` 기준으로 연결

이 구조에서는 `portfolio_snapshots`만 저장하면
추후 자산별 전월 비교, 카테고리별 변화, 특정 월 포트폴리오 복원 요구에 다시 막힌다.

따라서 현재 프로젝트에는 `asset_snapshots`가 더 적합하다.

---

## 목표

- 특정 월의 자산별 잔액을 저장
- 이번 달/지난달 총자산 비교를 정확히 계산
- 투자/현금 카테고리 전월 비교를 확장 가능하게 유지
- 자산별 월간 변화 조회 기반 마련

---

## 제안 스키마

### 테이블명

`asset_snapshots`

### 컬럼

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | `uuid` | 기본 키 |
| `user_id` | `uuid` | 스냅샷 소유 사용자 |
| `asset_id` | `uuid` | `assets.id` 참조 |
| `snapshot_month` | `date` | 스냅샷 기준 월, `YYYY-MM-01`로 정규화 |
| `balance` | `numeric` | 해당 월 기준 자산 잔액 |
| `created_at` | `timestamptz` | 생성 시각 |
| `updated_at` | `timestamptz` | 수정 시각 |

### 제약

- `unique(asset_id, snapshot_month)`

### 인덱스

- `index on snapshot_month`
- `index on asset_id`
- `index on user_id, snapshot_month`

### 초기 저장 컬럼 원칙

초기 버전에서는 `category`, `name` 같은 중복 컬럼을 스냅샷에 복제하지 않는다.
대신 조회 단순화와 RLS 적용을 위해 `user_id`는 함께 저장한다.

- 장점: 사용자 기준 조회와 정책 적용이 단순해짐
- 장점: 자산 삭제나 관계 이상 상황에서도 스냅샷 소유 주체를 직접 보존
- 장점: 정규화 유지
- 장점: 데이터 불일치 위험 감소
- 단점: 조회 시 `assets` 조인 필요

현재 단계에서는 이 단점보다 정합성 이점이 더 크다.

---

## 스냅샷 의미 정의

### 기준 월

- `snapshot_month`는 월 시작일 기준으로 저장
- 예: `2026-03-01`

### 의미

- 해당 월의 자산 상태를 대표하는 잔액 값으로 취급

### 주의

월말 확정 개념이 아직 없으므로
초기 버전의 스냅샷은 `엄밀한 월말 마감값`이 아니라
`해당 월 저장 시점 기준 자산 상태`에 가깝다.

이 의미는 문서와 코드에서 분명히 유지할 필요가 있다.

---

## 저장 시점 후보

### 선택지 A: 월 마감 액션 시 생성

- 장점: 의미가 가장 명확
- 장점: 진짜 월말 스냅샷 개념과 일치
- 단점: 현재 프로젝트에 마감 UX가 없음
- 단점: 별도 플로우 추가 필요

### 선택지 B: 월 저장 시 스냅샷 upsert

- 장점: 현재 구조에 바로 붙일 수 있음
- 장점: 별도 마감 UX 없이 도입 가능
- 단점: 월말 확정값과 저장 시점 값이 다를 수 있음

### 현재 프로젝트 권장안

초기 단계에서는 `선택지 B`를 적용한다.

즉, 특정 월 저장 시 그 월의 자산 상태를 `asset_snapshots`에 upsert한다.

이후 월 마감 개념이 필요해지면
`draft snapshot`과 `finalized snapshot`으로 확장 검토한다.

---

## 구현 단계

### Step 1: 타입 및 매퍼 추가

추가 대상

- `types/domain/asset-snapshot.ts`
- `types/database/asset-snapshot-row.ts`
- `services/mapper/assetSnapshotMapper.ts`

목표

- 기존 `Asset`, `Allocation` 구조와 동일한 계층 유지
- Supabase row와 domain type 간 변환 일관성 확보

### Step 2: Repository 추가

추가 대상

- `repositories/asset-snapshot.repository.ts`

필요 메서드

- 특정 월 스냅샷 조회
- 여러 월 스냅샷 조회
- 월별 스냅샷 upsert

목표

- 대시보드 조회와 저장 로직이 직접 Supabase 클라이언트에 의존하지 않도록 유지

### Step 3: 저장 로직 연결

변경 대상 후보

- `services/allocation/allocation.service.ts`

목표

- 배분 저장 후 해당 월 자산 상태를 스냅샷으로 기록
- 현재 자산 잔액과 월 기준 스냅샷의 관계를 일관되게 맞춤

주의

- 배분 저장과 스냅샷 저장이 분리되면 정합성 문제가 생길 수 있음
- 가능하면 DB 함수 또는 원자적 처리 구조 검토

### Step 4: 대시보드 계산 로직 교체

변경 대상 후보

- `app/(tabs)/index.tsx`
- 필요 시 대시보드 전용 훅 또는 계산 모듈

목표

- 현재 총자산: 이번 달 스냅샷 기준 계산
- 전월 대비: 이번 달 스냅샷 총합 - 지난달 스냅샷 총합
- 투자/현금 합계: 스냅샷 + 현재 자산 메타 기준 계산

### Step 5: 테스트 추가

추가 대상 후보

- 스냅샷 계산 유틸 테스트
- 스냅샷 repository 테스트
- 저장 후 스냅샷 생성 시나리오 테스트

검증 케이스

- 이번 달/지난달 스냅샷 모두 존재
- 지난달 스냅샷 없음
- 특정 자산만 신규 생성
- 같은 월 재저장 시 upsert 동작

### Step 6: 문서 및 운영 절차 정리

정리 대상

- Supabase SQL
- 로컬 적용 순서
- 스냅샷 의미 정의
- 향후 월 마감 확장 방향

---

## SQL 초안

```sql
create table if not exists asset_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  asset_id uuid not null references assets(id) on delete cascade,
  snapshot_month date not null,
  balance numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asset_id, snapshot_month)
);

create index if not exists idx_asset_snapshots_snapshot_month
  on asset_snapshots (snapshot_month);

create index if not exists idx_asset_snapshots_asset_id
  on asset_snapshots (asset_id);

create index if not exists idx_asset_snapshots_user_month
  on asset_snapshots (user_id, snapshot_month);
```

---

## 기대 효과

- 대시보드의 `총 자산 전월 대비` 정확도 향상
- 카테고리별 전월 비교 확장 기반 확보
- 자산별 월간 변화 기능으로 자연스럽게 확장 가능
- 현재 자산 중심 모델과 일관된 데이터 구조 유지

---

## 결론

현재 프로젝트에는 `portfolio_snapshots`보다 `asset_snapshots`가 더 적합하다.

이유는 다음과 같다.

- 현재 UI와 데이터 구조가 이미 자산 단위를 중심으로 동작
- 총합만 아니라 카테고리 합계와 자산 리스트까지 함께 다룸
- 향후 확장 시 재설계 비용을 줄일 수 있음

초기 구현은 `월 저장 시 스냅샷 upsert`로 시작하고,
필요 시 이후 월 마감 개념을 별도 도입하는 방향이 가장 현실적이다.
