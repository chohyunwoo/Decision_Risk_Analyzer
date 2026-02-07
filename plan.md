# Backend MVP Plan (Source of Truth: 승인된 MVP 설계 요약 + src/CLAUDE.md)

이 계획은 **구현 순서 중심**이며, 각 단계에서 **가장 먼저 작성할 테스트**를 명시한다.  
모든 단계는 **TDD (Red → Green → Refactor)** 를 따른다.  
설계 요약과 CLAUDE.md에 없는 기능은 포함하지 않는다.

---

## 전제
- **단일 도메인**: 음식(배달/외식) 의사결정 리스크 분석만.
- **Risk Scoring**: 고정된 feature 집합 + 고정 가중치 테이블 기반, **결정적(deterministic)** 계산.
- **LLM 역할 제한**: 점수 계산 금지. **설명/근거 요약만**.
- **입력 최소화**: 예) 음식점/배달 링크, 시간대, 가격대 등 **최소 입력만 허용**.
- **수익 모델**: 무료 총 3회 + **단건 결제 중심**.
- **복잡 인증/다중 플랜/고급 통계 제외**.

---

## 단계 1: Risk Scoring Engine (가장 먼저 시작)
목표: **고정 feature + 가중치 기반의 결정적 점수 계산** 구현.

먼저 작성할 테스트:
- [ ] `RiskScoringEngineTest.shouldReturnSameScoreForSameInput()`  
  동일 입력에 대해 항상 동일 점수가 반환되는지 검증.

다음 테스트:
- [ ] `RiskScoringEngineTest.shouldApplyFixedWeightsCorrectly()`  
  고정 가중치 테이블이 정확히 적용되는지 검증.
- [ ] `RiskScoringEngineTest.shouldReturnScoreWithinAllowedRange()`  
  점수 범위(예: 0~100)가 지켜지는지 검증.

구현 메모 (행동 코드 전용):
- 고정 feature 집합과 가중치 테이블을 **상수로 명시**.
- 입력 값 → feature 값 매핑은 **결정적**이어야 함.

---

## 단계 2: 최소 입력 모델/검증
목표: 음식 선택 상황 입력을 **최소 필드**로 제한하고 검증.

먼저 작성할 테스트:
- [ ] `FoodDecisionInputValidationTest.shouldRejectMissingRequiredFields()`  
  필수 최소 입력(예: 링크/시간대/가격대 중 필수로 정한 항목)이 없으면 실패.

다음 테스트:
- [ ] `FoodDecisionInputValidationTest.shouldAcceptMinimalValidInput()`  
  최소 입력만으로 통과되는지 확인.

구현 메모:
- **최소 입력 필드만** 허용 (예시 범위 내에서 확정).
- 불필요한 옵션/확장은 추가하지 않음.

---

## 단계 3: LLM 설명/근거 요약 모듈
목표: **점수 계산 없이** 설명/근거 요약만 생성.

먼저 작성할 테스트:
- [ ] `ExplanationServiceTest.shouldGenerateExplanationForGivenScoreAndInput()`  
  점수와 입력을 기반으로 설명이 생성되는지 검증 (LLM은 테스트 더블 사용).

다음 테스트:
- [ ] `ExplanationServiceTest.shouldNotModifyScore()`  
  설명 생성이 점수 결과에 영향을 주지 않음을 보장.

구현 메모:
- LLM 호출은 **인터페이스로 분리**하고 테스트에서는 Fake/Stub 사용.
- 출력은 설명 텍스트/근거 요약만 포함.

---

## 단계 4: 분석 서비스(조합)
목표: 입력 → 점수 계산 → 설명 생성 → 결과 객체 생성.

먼저 작성할 테스트:
- [ ] `AnalysisServiceTest.shouldCreateAnalysisWithScoreAndExplanation()`  
  Risk Scoring + Explanation 결과가 함께 생성되는지 검증.

다음 테스트:
- [ ] `AnalysisServiceTest.shouldBeDeterministicForSameInput()`  
  같은 입력으로 분석 생성 시 점수는 동일해야 함.

구현 메모:
- LLM은 점수 계산에 관여하지 않음.
- 결정적 점수는 항상 동일.

---

## 단계 5: 사용 가능 여부(무료 3회 + 단건 결제)
목표: **무료 3회 제한 + 단건 결제 중심** 정책을 최소 로직으로 적용.

먼저 작성할 테스트:
- [ ] `UsagePolicyTest.shouldAllowFirstThreeFreeAnalyses()`  
  무료 3회 허용.

다음 테스트:
- [ ] `UsagePolicyTest.shouldRequirePaymentAfterFreeQuota()`  
  3회 초과 시 결제 확인 없으면 거부.

구현 메모:
- 결제 확인은 **단건 결제 여부만** 확인.
- 구독 중심 로직은 구현하지 않음.

---

## 단계 6: API 최소 엔드포인트
목표: 프론트엔드가 MVP를 구동하는 데 필요한 최소 API만 제공.

먼저 작성할 테스트:
- [ ] `AnalysisControllerTest.shouldCreateAnalysis()`  
  최소 입력으로 분석 생성 API 성공 확인.

다음 테스트:
- [ ] `AnalysisControllerTest.shouldGetAnalysisById()`  
  생성된 분석을 조회할 수 있는지 확인.

구현 메모:
- 인증/플랜 복잡도 추가하지 않음.
- 응답에는 점수 + 설명만 포함 (고급 통계 제외).

---

## 단계 7: 저장소(최소)
목표: 분석 결과와 사용량을 최소 단위로 저장/조회.

먼저 작성할 테스트:
- [ ] `AnalysisRepositoryTest.shouldSaveAndLoadAnalysis()`  
  저장/조회 최소 동작 검증.

다음 테스트:
- [ ] `UsageRepositoryTest.shouldTrackUsageCount()`  
  무료 3회 제한을 위한 사용량 카운트 검증.

구현 메모:
- 저장 구조는 MVP 요구만 충족.
- 불필요한 필드/통계 추가 금지.

---

## 실행 규칙 (CLAUDE.md 준수)
- 매 단계마다 **테스트 → 최소 구현 → 테스트 통과 → 리팩터링** 순서.
- **한 번에 하나의 테스트**만 작성.
- 구조 변경과 동작 변경을 **분리**.
- 테스트 없는 구현은 완료로 간주하지 않음.

---

## 진행 방식
사용자가 "go"라고 말하면:
1. plan.md에서 **다음 미완료 테스트**를 찾는다.
2. 그 테스트를 먼저 작성하고 실패를 확인한다 (Red).
3. 테스트를 통과시키는 최소 코드를 작성한다 (Green).
4. 필요 시 리팩터링한다 (Refactor).
