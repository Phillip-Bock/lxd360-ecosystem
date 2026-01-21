# LXD360 AI System Overview

**EU AI Act Article 11 - Technical Documentation**

## 1. System Identification

| Field | Value |
|-------|-------|
| **System Name** | LXD360 Adaptive Learning Engine |
| **Version** | 2.6.0 |
| **Provider** | LXD360, LLC |
| **Intended Purpose** | Personalized learning path optimization and mastery assessment |
| **High-Risk Category** | Annex III, 3(a) - Educational AI |

## 2. Intended Purpose

The LXD360 Adaptive Learning Engine provides:

1. **Mastery Assessment**: Estimates learner knowledge state using Bayesian Knowledge Tracing (BKT)
2. **Content Recommendation**: Suggests optimal learning content based on Zone of Proximal Development
3. **Spaced Repetition**: Schedules review sessions using SM-2 algorithm
4. **Intervention Detection**: Identifies learners who may need support
5. **Progress Tracking**: Monitors and reports learning outcomes

### 2.1 Target Users

- **Learners**: Employees undergoing training, students in vocational programs
- **Instructors**: L&D professionals, course facilitators, trainers
- **Administrators**: Training managers, compliance officers

### 2.2 Deployment Context

- Corporate learning environments
- Healthcare training (HIPAA-compliant)
- Aerospace and defense training
- Government contractor training (FedRAMP path)

## 3. System Components

### 3.1 Core AI Subsystems

| Component | Type | Purpose | Location |
|-----------|------|---------|----------|
| BKT Engine | Probabilistic Model | Mastery estimation | `lib/adaptive-learning/bkt.ts` |
| SM-2 Scheduler | Algorithm | Spaced repetition | `lib/adaptive-learning/bkt.ts` |
| Cognitive Load Detector | Behavioral Analysis | Learner state monitoring | `lib/adaptive-learning/cognitive-load.ts` |
| Content Recommender | Rule-based + ML | Next content selection | `lib/adaptive-learning/bkt.ts:getNextBestContent` |
| Intervention System | Rule-based | Support recommendations | `lib/adaptive-learning/bkt.ts:recommendIntervention` |

### 3.2 External AI Providers (GPAI)

| Provider | Models Used | Purpose |
|----------|-------------|---------|
| Google Vertex AI | Gemini 2.0, 2.5 | Content generation, explanations |
| Anthropic | Claude (planned) | Alternative provider |
| OpenAI | GPT-4o (planned) | Alternative provider |

## 4. Functional Description

### 4.1 Input Data

The system processes:

1. **Learning Attempt Data**
   - Correctness of responses
   - Response time
   - Self-reported confidence ratings
   - Answer revision patterns

2. **Behavioral Telemetry**
   - Time to first action
   - Distractor consideration patterns
   - Click patterns (rage click detection)

3. **Content Metadata**
   - Required skills
   - Target skills taught
   - Difficulty level

### 4.2 Output Decisions

| Decision Type | Description | Human Override |
|---------------|-------------|----------------|
| Mastery Level | Novice/Developing/Proficient/Mastered | View only |
| Content Recommendation | Suggested next learning item | Yes - Skip |
| Review Schedule | When to revisit content | Yes - Dismiss |
| Intervention Alert | Support recommendation | Yes - Dismiss/Ignore |
| Path Adjustment | Learning path modification | Yes - Continue Anyway |

### 4.3 Decision Logic

```
1. Learner completes learning attempt
2. System collects behavioral telemetry
3. BKT updates mastery probability using Bayesian inference
4. Confidence adjustment applied for safety-critical contexts
5. SM-2 calculates next review date
6. System checks intervention triggers
7. If intervention needed, alert presented WITH dismissal option
8. Content recommender suggests next item based on ZPD
9. All decisions logged with full audit trail
```

## 5. Technical Specifications

### 5.1 Algorithm Parameters

**BKT Default Parameters:**
| Parameter | Symbol | Default | Range | Description |
|-----------|--------|---------|-------|-------------|
| Prior Knowledge | P(L₀) | 0.30 | 0.1-0.5 | Initial mastery probability |
| Learning Rate | P(T) | 0.10 | 0.05-0.3 | Learning per opportunity |
| Guess Probability | P(G) | 0.20 | 0.1-0.3 | Correct despite not knowing |
| Slip Probability | P(S) | 0.10 | 0.05-0.2 | Incorrect despite knowing |

**Safety-Critical Parameters:**
| Parameter | Value | Rationale |
|-----------|-------|-----------|
| P(L₀) | 0.20 | Conservative - assume less prior knowledge |
| P(T) | 0.12 | Slightly higher for motivated trainees |
| P(G) | 0.15 | Lower tolerance for lucky guessing |
| P(S) | 0.08 | Lower tolerance for careless errors |

### 5.2 Mastery Thresholds

| Level | Probability Range | Interpretation |
|-------|-------------------|----------------|
| Novice | < 0.40 | Requires significant instruction |
| Developing | 0.40 - 0.69 | Making progress |
| Proficient | 0.70 - 0.94 | Competent performance |
| Mastered | ≥ 0.95 | Expert-level understanding |

### 5.3 Intervention Triggers

| Trigger | Condition | Severity |
|---------|-----------|----------|
| Consecutive Failures | 3+ incorrect in a row | High |
| Overconfident Error | High confidence + wrong answer | Critical |
| Guessing Detected | Rapid response + low prior mastery | Medium |
| Progress Plateau | 10+ attempts, <50% mastery, <40% success | Medium |

## 6. Limitations

### 6.1 Known Limitations

1. **Cold Start**: New learners require 3-5 attempts before accurate mastery estimates
2. **Content Dependency**: Recommendations depend on complete skill tagging
3. **Response Time Sensitivity**: Unusual response times may affect guess detection
4. **Self-Report Bias**: Confidence calibration relies on honest self-assessment

### 6.2 Not Intended For

- High-stakes employment decisions
- Academic grading without instructor review
- Certification without human verification
- Replacing instructor judgment in edge cases

## 7. Human Oversight Mechanisms

See [human-oversight.md](../operations/human-oversight.md) for detailed documentation.

### 7.1 Summary

| Mechanism | Description |
|-----------|-------------|
| Skip Option | Learners can dismiss any recommendation |
| Continue Anyway | Override pathway adjustments |
| Request Instructor | Escalate to human support |
| Admin Dashboard | Instructor review of AI decisions |

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial documentation |

## 9. References

- Corbett, A. T., & Anderson, J. R. (1994). Knowledge tracing: Modeling the acquisition of procedural knowledge. User Modeling and User-Adapted Interaction, 4(4), 253-278.
- Pimsleur, P. (1967). A memory schedule. The Modern Language Journal, 51(2), 73-75.
- Wozniak, P. A. (1990). Optimization of repetition spacing in the practice of learning. University of Technology in Poznan.
