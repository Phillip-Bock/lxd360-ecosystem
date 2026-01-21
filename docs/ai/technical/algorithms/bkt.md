# Bayesian Knowledge Tracing (BKT) Algorithm

**EU AI Act Article 11 - Algorithm Documentation**

## 1. Algorithm Identification

| Field | Value |
|-------|-------|
| **Algorithm Name** | Bayesian Knowledge Tracing (BKT) |
| **Implementation** | `lib/adaptive-learning/bkt.ts` |
| **Version** | 1.0.0 |
| **Type** | Probabilistic Graphical Model |
| **Purpose** | Learner mastery estimation |

## 2. Mathematical Foundation

### 2.1 Model Description

BKT is a Hidden Markov Model (HMM) that estimates the probability that a learner has mastered a skill based on their observable performance.

**Hidden State:** Knowledge (Known/Unknown)
**Observable:** Performance (Correct/Incorrect)

### 2.2 Parameters

| Parameter | Symbol | Description | Default | Safety-Critical |
|-----------|--------|-------------|---------|-----------------|
| Prior Knowledge | P(L₀) | Initial probability of knowing | 0.30 | 0.20 |
| Learning Rate | P(T) | Probability of learning per opportunity | 0.10 | 0.12 |
| Guess Probability | P(G) | Probability of correct answer when unknown | 0.20 | 0.15 |
| Slip Probability | P(S) | Probability of incorrect answer when known | 0.10 | 0.08 |

### 2.3 Update Equations

#### Correct Response Update

```
P(L|correct) = P(correct|L) × P(L) / P(correct)

Where:
- P(correct|L) = 1 - P(S)
- P(correct) = P(correct|L) × P(L) + P(correct|¬L) × P(¬L)
- P(correct|¬L) = P(G)

Then apply learning:
P(L_new) = P(L|correct) + (1 - P(L|correct)) × P(T)
```

#### Incorrect Response Update

```
P(L|incorrect) = P(incorrect|L) × P(L) / P(incorrect)

Where:
- P(incorrect|L) = P(S)
- P(incorrect) = P(incorrect|L) × P(L) + P(incorrect|¬L) × P(¬L)
- P(incorrect|¬L) = 1 - P(G)

Then apply partial learning:
P(L_new) = P(L|incorrect) + (1 - P(L|incorrect)) × P(T) × 0.5
```

## 3. Implementation Details

### 3.1 Core Function

```typescript
// Location: lib/adaptive-learning/bkt.ts:updateKnowledgeState

export function updateKnowledgeState(
  state: KnowledgeState,
  attempt: AttemptRecord,
): { updatedState: KnowledgeState; insights: AttemptInsights }
```

### 3.2 Processing Steps

1. **Guess Detection** - Analyze behavioral signals for guessing
2. **Bayesian Update** - Apply BKT equations
3. **Confidence Adjustment** - Penalize overconfident errors (safety-critical)
4. **Bounds Enforcement** - Clamp to [0.001, 0.999]
5. **Streak Tracking** - Update consecutive correct/incorrect counts
6. **Response Time EMA** - Update average response time
7. **Confidence Calibration** - Track self-assessment accuracy
8. **Spaced Repetition** - Update SM-2 parameters
9. **Intervention Check** - Determine if support needed

### 3.3 Guess Detection Algorithm

```typescript
// Location: lib/adaptive-learning/bkt.ts:detectGuessing

Signals combined using:
P(guess) = 1 - Π(1 - signal_i) for all signals

Signals:
- Rapid response (< 10% expected time): 0.9 weight
- No distractor consideration: 0.4 weight
- Low mastery + correct: 0.3 weight
- No revision on hard question: 0.2 weight

Maximum capped at 0.95
```

### 3.4 Confidence Adjustment (Safety-Critical)

For safety-critical contexts:

```typescript
// Overconfident Error Penalty
if (!correct && confidence > 0.7) {
  penalty = 0.15 × confidence
  mastery = mastery × (1 - penalty)
}

// Underconfident Correct Boost
if (correct && confidence < 0.3) {
  boost = 0.05 × (1 - confidence)
  mastery = min(0.99, mastery + boost)
}
```

## 4. Mastery Level Classification

| Level | Probability Range | Description |
|-------|-------------------|-------------|
| Novice | P(L) < 0.40 | Limited understanding |
| Developing | 0.40 ≤ P(L) < 0.70 | Building competence |
| Proficient | 0.70 ≤ P(L) < 0.95 | Competent performance |
| Mastered | P(L) ≥ 0.95 | Expert-level mastery |

## 5. Validation

### 5.1 Parameter Bounds

All parameters are validated:
- P(L₀): [0.1, 0.5]
- P(T): [0.05, 0.3]
- P(G): [0.1, 0.3]
- P(S): [0.05, 0.2]

### 5.2 Output Bounds

Mastery probability is always clamped to [0.001, 0.999] to prevent:
- Division by zero errors
- Overconfident predictions

### 5.3 Consistency Checks

- Mastery can only increase to 0.999 maximum
- Mastery can only decrease to 0.001 minimum
- Learning rate applies after every attempt (full or partial)

## 6. Limitations

### 6.1 Model Assumptions

1. **Binary Knowledge State** - Assumes skill is either known or unknown
2. **Single Skill** - Each skill tracked independently
3. **Stationary Parameters** - Parameters don't change over time
4. **Independence** - Assumes attempts are independent

### 6.2 Known Issues

1. **Cold Start Problem** - 3-5 attempts needed for stable estimates
2. **Parameter Sensitivity** - Results depend on parameter tuning
3. **Gaming Vulnerability** - Strategic behavior can affect accuracy
4. **Context Independence** - Doesn't account for learning context

## 7. References

1. Corbett, A. T., & Anderson, J. R. (1994). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4(4), 253-278.

2. Baker, R. S., Corbett, A. T., & Aleven, V. (2008). More accurate student modeling through contextual estimation of slip and guess probabilities in bayesian knowledge tracing. *Proceedings of ITS 2008*, 406-415.

3. Pardos, Z. A., & Heffernan, N. T. (2011). KT-IDEM: Introducing item difficulty to the knowledge tracing model. *Proceedings of UMAP 2011*, 243-254.

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial documentation |
