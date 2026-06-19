# PRD: 숫자 파싱 규칙 정리 및 음수 입력 방어

## 1. 배경

- 숫자 입력 처리 방식이 화면별로 달라 같은 입력값도 서로 다른 결과 발생 가능
- `parseNumber`가 음수 문자열을 양수로 보정할 수 있어 사용자의 입력 의미가 저장 직전에 왜곡될 위험
- UI 계층과 서비스 계층의 책임이 섞여 저장 가능 여부 판단 기준의 일관 적용 어려움

## 2. 목표

- 숫자 입력 처리 규칙을 화면별로 일관되게 정리
- UI 계층은 입력 문자열 표시와 포매팅 담당, 서비스 계층은 숫자 변환과 저장 가능 여부 판단
- 음수 입력이 저장 시 양수로 보정되지 않도록 차단
- 빈 값은 화면 UX에 맞게 `0` 또는 `null`로 일관 처리

## 3. 범위

### 포함

- `parseNumber` 반환 계약 변경
- 음수 및 비정상 숫자 문자열 방어 규칙 추가
- 포트폴리오 숫자 변환 책임을 서비스 계층으로 이동
- 배분 저장과 자산 금액 저장의 유효성 처리 추가
- 계산용 훅의 fallback 처리 추가
- 파서와 저장 서비스 테스트 추가

### 제외

- 숫자 입력 컴포넌트 전면 교체
- 통화 포맷 디자인 개편
- 서버 DB 제약조건 추가
- 모든 화면의 UX 문구 전면 개편

## 4. 요구사항

| ID | 요구사항 | 완료 기준 |
| --- | --- | --- |
| REQ-1 | 포맷 문자열을 숫자로 변환 | `1,234` 입력이 `1234`로 변환 |
| REQ-2 | 빈 값 처리 기준 제공 | 빈 문자열, 공백 문자열, `nullish` 값이 계산용으로 `0` 처리 |
| REQ-3 | 음수 입력 차단 | 음수 문자열과 음수 숫자가 `null`로 반환되고 저장 시 에러 처리 |
| REQ-4 | 비정상 문자열 차단 | 숫자가 아닌 문자열이 `null`로 반환되고 저장 시 에러 처리 |
| REQ-5 | UI와 서비스 책임 분리 | UI는 문자열 상태와 포매팅만 담당하고 저장 판단은 service에서 처리 |
| REQ-6 | 배분 저장 규칙 적용 | 양수는 저장, 빈 값은 `0` 해석 후 저장 대상 제외, 음수와 비숫자는 에러 처리 |
| REQ-7 | 자산 금액 저장 규칙 적용 | 양수는 저장, 빈 값은 `null` 저장, 음수와 비숫자는 에러 처리 |
| REQ-8 | 테스트로 파싱 정책 고정 | 파서, 배분 저장, 자산 저장 음수 방어 테스트 추가 |

## 5. 참고 맥락

- 관련 파일:
  - `components/dashboard/PortfolioList.tsx`
  - `hooks/useUpdateAssets.ts`
  - `hooks/useAllocationHistory.ts`
  - `services/allocation/allocation.service.ts`
  - `services/asset/asset.service.ts`
  - `utils/formatters/parseNumber.ts`
  - `utils/formatters/parseNumber.test.ts`
  - `services/allocation/allocation.service.test.ts`
  - `services/asset/asset.service.test.ts`
- 계층별 책임:

| 계층 | 역할 |
| --- | --- |
| UI | 입력 문자열 포매팅, 입력 상태 유지 |
| Hook | mutation 연결, 캐시 무효화 |
| Service | 숫자 파싱, 변경점 계산, 유효성 판단 |
| Repository | DB 컬럼 매핑 및 저장 |

- 저장 시 처리 규칙:

| 입력 값 | 배분 저장 | 자산 금액 저장 |
| --- | --- | --- |
| 양수 | 저장 | 저장 |
| 빈 값 | `0`으로 해석 후 저장 대상에서 제외 | `null`로 저장 |
| 음수 | 에러 처리 | 에러 처리 |
| 숫자가 아닌 문자열 | 에러 처리 | 에러 처리 |

- 리스크:
  - `parseNumber` 계약 변경은 호출부 전반에 영향 가능
  - 빈 값을 `0`으로 볼지, 오류로 볼지 화면별 UX 차이 존재
  - 저장 경로와 계산 경로가 같은 파서를 쓰므로 fallback 처리 명확화 필요

## 6. 작업 계획

진행 규칙: 1번부터 순서대로 하나씩 진행하며, 각 단계마다 `작업 완료 → 자체 검증 → 필요 시 수정 또는 사용자 확인 → 사용자 검수 → 다음 단계 진행` 순서 준수

1. `PortfolioList`에서 숫자 파싱 제거 후 입력 상태를 문자열 그대로 유지
2. `useUpdateAssets`가 자산 금액 저장 service를 호출하도록 정리
3. `asset.service`에 자산 금액 파싱과 업데이트 payload 생성 책임 추가
4. `parseNumber` 반환 타입을 `number | null`로 변경
5. `parseNumber`에 음수, 비정상 문자열, 빈 값 처리 규칙 추가
6. `allocation.service`에서 `parseNumber` 결과가 `null`이면 예외 처리하고 `0` 이하 항목을 저장 대상에서 제외
7. `asset.service`에서 빈 값만 `null` 저장으로 허용하고 음수와 비숫자는 예외 처리
8. `useAllocationHistory` 계산 로직에서 `parseNumber(...) ?? 0` fallback 적용
9. `parseNumber`, 배분 저장, 자산 금액 저장 테스트 추가

## 7. 검증

- `allocation` 화면에서 빈 금액 항목이 있어도 저장 흐름 유지
- `history` 편집 중 빈 값과 음수 값이 합계 계산을 깨지 않는지 확인
- `portfolio` 수정에서 빈 값은 `null`, 음수는 오류로 구분되는지 확인
- 서비스에서 던진 검증 오류가 mutation 경로를 통해 UI까지 전달되는지 확인
- 테스트가 숫자 파싱 정책과 저장 방어 정책 고정
