# Mock → 실제 API/DB 연동 계획

## 개요

Mock 데이터를 제거하고 Supabase Repository를 실제로 호출하는 TanStack Query 기반 hooks를 도입하여,
대시보드와 배분 화면을 실제 DB 데이터 기반으로 전환한다.

---

## 기술 스택

- **서버 데이터 페칭**: TanStack Query (`@tanstack/react-query`)
  - RTK Query 대신 선택한 이유: Redux 셋업 없이 독립 동작, 코드 간결, Supabase JS 클라이언트와 궁합 우수
- **DB/백엔드**: Supabase (기존 유지)
- **Repository 레이어**: 기존 `assetRepository`, `allocationRepository` 그대로 사용

---

## 현재 상태 (변경 전)

| 파일 | 문제점 |
|---|---|
| `app/(tabs)/index.tsx` | `DASHBOARD_DATA` (mock) 하드코딩 |
| `components/allocation/AssetListContent.tsx` | `MY_ASSETS_DB` (mock) 하드코딩 |
| `app/(tabs)/two.tsx` | `handleSave()` 미구현 (TODO) |
| `components/dashboard/PortfolioList.tsx` | mock `Asset` 타입 사용 (도메인 타입과 불일치) |

### 타입 불일치 상세

```
mock Asset (mock-dashboard.ts)
  { id, name, category, amount, profit, color, icon }

domain Asset (types/domain/asset.ts)
  { id, userId, name, category, currentBalance, iconName, color, createdAt, updatedAt }
```

---

## 아키텍처 흐름

```
Supabase
  ├── assetRepository.getAssets()       ──→ useAssets (useQuery)
  │                                           ├──→ app/(tabs)/index.tsx (대시보드)
  │                                           └──→ AssetListContent (자산 선택 모달)
  │
  └── allocationRepository.createAllocation() ──→ useSaveAllocation (useMutation)
        (커스텀 자산: createAsset() 선행)              └──→ app/(tabs)/two.tsx (배분 저장)
```

---

## 단계별 작업

### Step 0: TanStack Query 설치 및 셋업

```bash
npx expo install @tanstack/react-query
```

- `app/_layout.tsx`에 `QueryClient`, `QueryClientProvider` 추가

---

### Step 1: `hooks/useAssets.ts` 생성

```typescript
export const useAssets = () =>
  useQuery({
    queryKey: ['assets'],
    queryFn: () => assetRepository.getAssets(),
  });
```

- `loading`, `error`, `data` 자동 관리
- 대시보드 + 배분 모달 두 곳에서 공통 사용

---

### Step 2: `hooks/useSaveAllocation.ts` 생성

```typescript
export const useSaveAllocation = () =>
  useMutation({
    mutationFn: (items: AllocationItem[]) => saveAllocations(items),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });
```

- DB에 등록된 자산: `assetId` 직접 사용 → `createAllocation`
- 커스텀 자산 (DB 미등록): `createAsset` 실행 후 반환된 `id`로 `createAllocation`
- `allocationMonth`: 현재 년월 (`YYYY-MM-DD` 포맷, DB DATE 타입 호환)
- 저장 성공 시 `assets` 쿼리 자동 무효화 → 대시보드 자동 갱신

---

### Step 3: `PortfolioList` 타입 교체

- `components/dashboard/PortfolioList.tsx`
- props 타입: mock `Asset` → 도메인 `Asset`
- 필드 교체: `amount` → `currentBalance`, `icon` → `iconName`
- `profit` 필드는 도메인에 없으므로 수익률 표시 제거

---

### Step 4: Dashboard 화면 실제 데이터 연동

- `app/(tabs)/index.tsx`
- `DASHBOARD_DATA` import 제거
- `useAssets()` 호출 후 파생 값 계산

```typescript
const { data: assets = [], isLoading } = useAssets();

const totalAssets = assets.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
const investTotal = assets.filter(a => a.category === 'INVEST').reduce(...);
const cashTotal = assets.filter(a => a.category === 'CASH').reduce(...);
```

- 로딩 중 스켈레톤 또는 ActivityIndicator 표시
- 에러 시 에러 메시지 표시

---

### Step 5: `AssetListContent` 실제 데이터 연동

- `components/allocation/AssetListContent.tsx`
- `MY_ASSETS_DB` 제거 → `useAssets()` 사용
- `onSelectAsset` 시그니처에 `assetId` 추가

```typescript
// 변경 전
onSelectAsset: (name: string, category: CategoryType) => void

// 변경 후
onSelectAsset: (assetId: string, name: string, category: CategoryType) => void
```

---

### Step 6: `AssetSelectionModal` 시그니처 갱신

- `components/allocation/AssetSelectionModal.tsx`
- `onAddAsset` props 타입을 Step 5와 동일하게 갱신

---

### Step 7: `AllocationItem` 타입 확장 및 `handleSave` 구현

- `app/(tabs)/two.tsx`
- `AllocationItem`에 `assetId?: string` 추가
- `handleAddAsset`에 `assetId` 파라미터 추가
- `handleSave`에서 `useSaveAllocation` 호출

```typescript
const { mutate: saveAllocation, isPending } = useSaveAllocation();

const handleSave = () => saveAllocation(items);
```

---

## 변경 파일 목록

| 파일 | 작업 |
|---|---|
| `app/_layout.tsx` | `QueryClientProvider` 추가 |
| `hooks/useAssets.ts` | 신규 생성 |
| `hooks/useSaveAllocation.ts` | 신규 생성 |
| `components/dashboard/PortfolioList.tsx` | 도메인 타입으로 교체 |
| `app/(tabs)/index.tsx` | mock 제거, `useAssets` 연결 |
| `components/allocation/AssetListContent.tsx` | mock 제거, `useAssets` 연결 |
| `components/allocation/AssetSelectionModal.tsx` | `onAddAsset` 시그니처 갱신 |
| `app/(tabs)/two.tsx` | `AllocationItem` 확장, `handleSave` 구현 |

---

### Step 8: Supabase RPC (Bulk Update Asset Balances)

동시성 문제(Race Condition)를 방지하고 트랜잭션의 원자성(Atomicity)을 보장하기 위해, 자산 잔액 일괄 업데이트에 사용되는 데이터베이스 함수

#### 적용 방법
Supabase 대시보드의 **SQL Editor**에 접속하여 아래의 SQL 코드를 복사해서 실행(Run)

```sql
create or replace function bulk_update_asset_balances(
  updates jsonb
) returns void language plpgsql as $$
begin
  update assets
  set current_balance = current_balance + item.amount
  from jsonb_to_recordset(updates) as item(id uuid, amount numeric)
  where assets.id = item.id;
end;
$$;
```

> **참고**: 이 함수는 `updates`라는 JSON 배열을 파라미터로 받아서, 각 객체의 `id`에 해당하는 자산을 찾고 `amount`만큼 `current_balance`에 합산

#### 쿼리 구문 상세 분석

##### 1. `CREATE OR REPLACE FUNCTION`
데이터베이스 마이그레이션 및 배포 시 **멱등성(Idempotency)**을 보장하기 위한 표준 DDL 패턴

* **`CREATE`**: 새로운 저장 프로시저(함수)를 데이터베이스에 정의.
* **`OR REPLACE`**: 동일한 시그니처를 가진 함수가 이미 존재할 경우, 충돌 에러를 발생시키는 대신 새로운 정의로 안전하게 덮어씌움. 기존 함수에 부여된 권한(Grants)이나 의존성이 파괴되지 않고 그대로 유지됨.

##### 2. `UPDATE ... SET ... FROM ... WHERE`
단일 쿼리로 여러 행을 일괄 수정(Bulk Update)할 때 사용하는 PostgreSQL의 확장 문법. 쿼리 실행 엔진은 이 구문들을 결합하여 타겟 테이블과 데이터 소스를 조인한 뒤 업데이트를 수행.

* **`UPDATE assets` (타겟 지정)**
  수정할 대상 테이블을 선언. 실행 시 이 테이블의 해당 행(Row)들에 대해 쓰기 잠금(Row-level Write Lock)을 획득하여 트랜잭션의 안전성을 확보.

* **`SET current_balance = current_balance + item.amount` (원자적 연산)**
  변경할 컬럼과 새로운 값을 정의. 애플리케이션 메모리로 값을 가져오지 않고 DB 엔진 내부에서 기존 값에 직접 덧셈 연산을 수행하므로, 동시성 처리 시 발생할 수 있는 경쟁 상태(Race Condition)를 원천적으로 차단.

* **`FROM jsonb_to_recordset(updates) AS item(...)` (데이터 소스 주입)**
  업데이트에 사용할 조인 대상(데이터 소스)을 제공. 파라미터로 받은 JSON 배열을 RDBMS가 이해할 수 있는 메모리 상의 임시 가상 테이블(이름: `item`)로 전개(Unnesting)하여 `UPDATE` 문 내부에서 활용할 수 있게 함.

* **`WHERE assets.id = item.id` (조인 및 필터링 조건)**
  타겟 테이블(`assets`)과 `FROM` 절에서 만든 가상 테이블(`item`)을 매핑하는 조건. 내부적으로 두 테이블을 `INNER JOIN` 하는 것과 같은 실행 계획(Execution Plan)을 가지며, 일치하는 레코드에 대해서만 `SET` 연산을 트리거.
