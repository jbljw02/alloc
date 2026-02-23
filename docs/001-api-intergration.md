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
- `allocationMonth`: 현재 년월 (`YYYY-MM` 포맷)
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
