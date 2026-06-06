# PRD: 내역 페이지 월별 자금 흐름 수정 기능

## 1. 배경

- 현재 내역 페이지는 월별 자금 흐름 조회만 지원
- 배분 페이지는 이번 달 데이터 신규 저장만 지원해 과거 월 데이터 편집 불가
- 기존 저장 구조는 같은 월 데이터를 다시 저장해도 기존 데이터를 대체하지 않고 신규 row 추가
- 자산 잔액도 입력 금액만큼 다시 누적되어 과거 월 수정 시 중복 반영 위험 존재

## 2. 목표

- 내역 페이지에서 선택한 월의 배분 데이터를 직접 편집
- 저장 시 현재 날짜가 아니라 선택한 월 기준으로 처리
- 기존 월 데이터와 편집 데이터를 비교해 추가, 수정, 삭제 구분
- 자산 잔액은 변경 전후 차이만 반영해 정합성 유지

## 3. 범위

### 포함

- 내역 페이지 편집 모드 UI 추가
- 선택 월 기반 배분 저장 구조 도입
- 월 단위 배분 데이터 동기화 로직 추가
- 자산 잔액 diff 반영 로직 추가
- 빈 값, `0원`, 저장 실패 등 예외 UX 정리

### 제외

- 월별 리포트 시각화 개편
- 자산 추가/삭제 관리 화면 구현
- 전체 자산 잔액 재계산 배치 구현
- DB 스키마 전면 재설계

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-1 | 내역 페이지에서 편집 모드 진입/취소 제공 | 선택 월 데이터에 대해 편집, 취소, 저장 흐름 사용 가능 |
| REQ-2 | 편집 모드에서 항목 변경 지원 | 금액 수정, 항목 제거, 자산 추가 가능 |
| REQ-3 | 저장 기준 월을 외부에서 주입 | 저장 서비스가 `new Date()` 고정값 대신 선택 월 파라미터 사용 |
| REQ-4 | 월 단위 데이터 동기화 수행 | 기존 데이터와 편집 데이터를 비교해 생성, 수정, 삭제 처리 |
| REQ-5 | 자산 잔액을 diff 기준으로 보정 | 신규은 양수 diff, 삭제는 음수 diff, 수정은 증감 diff만 반영 |
| REQ-6 | 예외 처리와 버튼 상태 정리 | 빈 데이터, `0원`, 저장 실패 케이스에서 사용자가 상태를 이해 가능 |

## 5. 참고 맥락

- 관련 파일:
  - `app/(tabs)/history.tsx`
  - `app/(tabs)/allocation.tsx`
  - `components/history/HistoryItemList.tsx`
  - `components/allocation/AllocationList.tsx`
  - `hooks/useAllocationHistory.ts`
  - `hooks/useSaveAllocation.ts`
  - `services/allocation/allocation.service.ts`
  - `repositories/allocation.repository.ts`
  - `repositories/asset.repository.ts`
  - `types/domain/allocation.ts`
- 현재 한계:
  - `allocation.service`가 저장 시 항상 현재 날짜 기준 `allocationMonth` 사용
  - `allocationRepository.bulkCreateAllocation()`은 신규 row 추가만 지원
  - `assetRepository.bulkUpdateBalance()`는 저장 금액을 자산 잔액에 누적 반영
- 제약/주의사항:
  - 화면 수정뿐 아니라 데이터 정합성 변경 포함
  - `Step 3` 월 단위 sync와 `Step 4` 자산 잔액 보정 분리 검증
  - 관련 없는 워크트리 변경 제외

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서 준수

1. `history` 화면에 선택 월 편집 모드 진입, 저장, 취소 UI 추가
2. `HistoryItemList`를 읽기 전용과 편집 모드 모두 지원하도록 확장하거나 편집 전용 리스트 분리
3. 편집 모드에서 금액 수정, 항목 제거, 자산 추가 상태 관리
4. `useSaveAllocation`과 `allocation.service`가 저장 월 파라미터를 받도록 변경
5. `history` 화면에서 현재 선택 월을 저장 로직에 전달
6. 선택 월의 기존 배분 데이터와 편집 데이터를 비교하는 월 단위 sync 로직 추가
7. `allocationRepository`에 월별 조회, 수정, 삭제 조합을 지원하는 메서드 추가
8. 변경 전후 금액 차이를 계산해 `assetRepository`의 잔액 업데이트에 diff만 전달
9. 빈 데이터, `0원`, 데이터 없음, 저장 성공/실패 UX 정리

## 7. 검증

- 내역 페이지에서 선택 월 데이터를 편집하고 취소하면 원래 표시 상태로 복귀
- 선택 월 저장 시 현재 월이 아니라 선택한 월의 데이터만 변경
- 기존 항목 수정, 신규 항목 추가, 기존 항목 삭제가 각각 올바른 DB 작업으로 반영
- 자산 잔액이 입력값 전체가 아니라 변경 전후 diff만큼 반영
- 빈 데이터와 `0원` 입력이 정의한 정책대로 처리
