# Human Oversight Mechanisms

**EU AI Act Article 14 - Human Oversight**

## 1. Overview

This document describes the human oversight mechanisms implemented in the LXD360 Adaptive Learning Engine to ensure AI decisions can be reviewed, overridden, and corrected by qualified humans.

## 2. Oversight Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LEARNER INTERFACE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Skip Option  │  │  Dismiss AI  │  │   Request    │      │
│  │              │  │  Intervention│  │  Instructor  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   INSTRUCTOR INTERFACE                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Review AI  │  │   Override   │  │  Escalate to │      │
│  │   Decisions  │  │   Mastery    │  │    Admin     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    ADMIN INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Emergency   │  │  Algorithm   │  │   Audit      │      │
│  │  AI Disable  │  │  Parameter   │  │   Reports    │      │
│  │              │  │  Adjustment  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 3. Learner Oversight Mechanisms

### 3.1 Intervention Dismissal

**Location:** `components/adaptive-learning/InterventionModal.tsx`

Learners can dismiss or skip any AI intervention:

| Action | Behavior |
|--------|----------|
| "Skip for now" | Dismisses intervention, logs as skipped |
| "Continue Anyway" | Overrides path adjustment |
| "Request Instructor" | Escalates to human support |

### 3.2 Recommendation Override

Learners are not forced to follow content recommendations. They can:

- Select any unlocked content regardless of recommendation
- Mark content as "Not Relevant" to adjust future recommendations
- Request alternative content suggestions

### 3.3 Confidence Self-Reporting

Before submitting answers, learners can:
- Indicate confidence level (used for calibration only)
- Flag questions as unclear or problematic
- Request additional explanation

## 4. Instructor Oversight Mechanisms

### 4.1 AI Decision Review Dashboard

**Planned Feature:** Instructor dashboard showing:

- Recent AI mastery assessments for their learners
- Flagged interventions that were overridden
- Learners who may need manual review
- Algorithm confidence scores

### 4.2 Manual Mastery Override

Instructors can manually adjust mastery levels when:
- Assessment results don't reflect observed competency
- External evidence supports different assessment
- Learner has completed alternative demonstration

### 4.3 Intervention Control

Instructors can:
- Disable specific intervention types for individual learners
- Adjust intervention sensitivity thresholds
- Add custom interventions not triggered by AI

## 5. Administrator Oversight Mechanisms

### 5.1 Emergency AI Disable

**Planned Feature:** Global and per-feature disable switches:

| Switch | Scope | Effect |
|--------|-------|--------|
| Global AI Disable | All AI features | Fallback to rule-based only |
| BKT Disable | Mastery assessment | Fixed progression |
| Recommendations Disable | Content suggestions | Manual content selection |
| Interventions Disable | Support alerts | No automated interruptions |

### 5.2 Algorithm Parameter Adjustment

Administrators can adjust:
- BKT parameters (pInit, pLearn, pGuess, pSlip)
- Mastery thresholds
- Intervention trigger conditions
- Recommendation scoring weights

### 5.3 Audit Access

Full audit trail available to:
- View all AI decisions for any learner
- Export decision logs for regulatory review
- Analyze aggregate AI behavior patterns
- Investigate specific incidents

## 6. Escalation Procedures

### 6.1 Escalation Levels

| Level | Trigger | Responder | SLA |
|-------|---------|-----------|-----|
| L1 | Learner request | Instructor | 4 hours |
| L2 | Instructor escalation | Training Manager | 24 hours |
| L3 | Safety concern | AI Compliance Officer | 4 hours |
| L4 | Regulatory inquiry | Legal/Executive | Immediate |

### 6.2 Incident Categories

| Category | Description | Required Action |
|----------|-------------|-----------------|
| Safety | Potential harm to learner | Emergency disable, investigation |
| Accuracy | Systematic prediction errors | Algorithm review, parameter adjustment |
| Bias | Disparate impact detected | Bias audit, remediation |
| Privacy | Data handling concern | Privacy review, notification |

## 7. Reviewer Qualifications

### 7.1 Instructor Requirements

To review AI decisions, instructors must:
- Complete AI oversight training module
- Understand BKT fundamentals
- Know when to escalate

### 7.2 Administrator Requirements

To adjust AI parameters, administrators must:
- Complete advanced AI governance training
- Understand impact of parameter changes
- Document all changes with rationale

## 8. Override Documentation

All human overrides are logged with:
- Timestamp
- User performing override
- Original AI decision
- Override decision
- Rationale provided
- Supporting evidence

## 9. Implementation Status

| Mechanism | Status | Location |
|-----------|--------|----------|
| Intervention dismissal | ✅ Implemented | InterventionModal.tsx |
| "Skip for now" | ✅ Implemented | InterventionModal.tsx |
| "Continue Anyway" | ✅ Implemented | pathway_adjustment action |
| "Request Instructor" | ✅ Implemented | frustration_support action |
| Instructor dashboard | ❌ Not Implemented | Planned Q2 2026 |
| Manual mastery override | ❌ Not Implemented | Planned Q2 2026 |
| Emergency AI disable | ❌ Not Implemented | Planned Q1 2026 |
| Parameter adjustment UI | ❌ Not Implemented | Planned Q2 2026 |

## 10. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | LXD360 | Initial documentation |
