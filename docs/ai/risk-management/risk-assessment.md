# AI Risk Assessment

**EU AI Act Article 9 - Risk Management System**

## 1. Document Control

| Field | Value |
|-------|-------|
| **Document ID** | LXD360-AI-RISK-001 |
| **Version** | 1.0.0 |
| **Status** | DRAFT |
| **Owner** | AI Compliance Officer |
| **Last Review** | 2026-01-19 |
| **Next Review** | 2026-04-19 |

## 2. Scope

This risk assessment covers all AI systems within the LXD360 Adaptive Learning Engine, classified as a high-risk AI system under EU AI Act Annex III, Category 3(a).

### 2.1 Systems Covered

| System | Purpose | Risk Category |
|--------|---------|---------------|
| BKT Engine | Mastery assessment | High |
| Content Recommender | Learning path suggestions | High |
| Intervention System | Support recommendations | High |
| SM-2 Scheduler | Review scheduling | Medium |
| Cognitive Load Detector | Learner state monitoring | Medium |

## 3. Risk Identification Methodology

### 3.1 Risk Categories

1. **Safety Risks** - Potential harm to learners
2. **Fundamental Rights Risks** - Impact on rights and freedoms
3. **Technical Risks** - System failures or errors
4. **Operational Risks** - Deployment and maintenance issues
5. **Bias Risks** - Discriminatory outcomes

### 3.2 Stakeholder Groups

| Stakeholder | Vulnerability Level | Special Considerations |
|-------------|---------------------|------------------------|
| Adult Learners | Standard | None |
| New Employees | Medium | Higher stress, performance anxiety |
| Learners with Disabilities | High | Accessibility, accommodation needs |
| Non-Native Speakers | Medium | Language barriers |
| Older Learners | Medium | Technology familiarity |

## 4. Risk Register

### 4.1 High-Priority Risks

#### RISK-001: Incorrect Mastery Assessment

| Field | Value |
|-------|-------|
| **Category** | Technical |
| **Likelihood** | Medium |
| **Impact** | High |
| **Risk Score** | HIGH |

**Description:** BKT algorithm incorrectly assesses learner mastery, leading to premature certification or unnecessary remediation.

**Potential Harms:**
- Learner certified before achieving actual competency
- Safety-critical skills under-assessed
- Learner frustration from incorrect difficulty

**Mitigation Measures:**
- Confidence calibration tracking
- Human review for certification decisions
- Safety-critical parameter presets
- Multiple assessment modalities

**Residual Risk:** MEDIUM - Mitigated by human oversight

---

#### RISK-002: Biased Recommendations

| Field | Value |
|-------|-------|
| **Category** | Bias |
| **Likelihood** | Medium |
| **Impact** | High |
| **Risk Score** | HIGH |

**Description:** Content recommendations may systematically disadvantage certain learner groups based on protected characteristics.

**Potential Harms:**
- Disparate learning outcomes
- Discrimination in career advancement
- Violation of equal opportunity principles

**Mitigation Measures:**
- Bias monitoring in recommendation outcomes
- Demographic parity analysis
- Regular algorithm audits
- Diverse training data

**Residual Risk:** MEDIUM - Requires ongoing monitoring

---

#### RISK-003: Over-Reliance on AI Decisions

| Field | Value |
|-------|-------|
| **Category** | Operational |
| **Likelihood** | High |
| **Impact** | Medium |
| **Risk Score** | HIGH |

**Description:** Instructors and learners may over-rely on AI recommendations without appropriate critical evaluation.

**Potential Harms:**
- Automation bias
- Reduced human judgment
- Missed edge cases

**Mitigation Measures:**
- Clear AI limitation disclosures
- Override mechanisms for all decisions
- Instructor training on AI capabilities
- Glass Box explanations

**Residual Risk:** MEDIUM - Human oversight implemented

---

### 4.2 Medium-Priority Risks

#### RISK-004: Guess Detection Errors

| Field | Value |
|-------|-------|
| **Category** | Technical |
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Risk Score** | MEDIUM |

**Description:** System incorrectly flags legitimate quick responses as guessing.

**Potential Harms:**
- Unfair mastery penalties
- Learner frustration
- Expert learners disadvantaged

**Mitigation Measures:**
- Conservative guess threshold (0.7)
- Response time normalization
- Adaptive expected time calculation

**Residual Risk:** LOW

---

#### RISK-005: Intervention Fatigue

| Field | Value |
|-------|-------|
| **Category** | Safety |
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Risk Score** | MEDIUM |

**Description:** Excessive interventions cause learner frustration and disengagement.

**Potential Harms:**
- Reduced learning effectiveness
- System abandonment
- Negative learner experience

**Mitigation Measures:**
- Intervention frequency limits
- Severity-based escalation
- Dismissable interventions
- Personalized intervention thresholds

**Residual Risk:** LOW

---

#### RISK-006: Data Privacy Breach

| Field | Value |
|-------|-------|
| **Category** | Fundamental Rights |
| **Likelihood** | Low |
| **Impact** | High |
| **Risk Score** | MEDIUM |

**Description:** Learning performance data exposed or misused.

**Potential Harms:**
- Privacy violation
- Employment discrimination
- Reputational damage

**Mitigation Measures:**
- Pseudonymization in AI logs
- Role-based access control
- Encryption at rest and in transit
- GDPR compliance measures

**Residual Risk:** LOW

---

### 4.3 Low-Priority Risks

#### RISK-007: Cold Start Inaccuracy

| Field | Value |
|-------|-------|
| **Category** | Technical |
| **Likelihood** | High |
| **Impact** | Low |
| **Risk Score** | LOW |

**Description:** New learners receive less accurate recommendations until sufficient data collected.

**Mitigation:** Pre-assessment option, conservative initial recommendations

---

#### RISK-008: Algorithm Gaming

| Field | Value |
|-------|-------|
| **Category** | Technical |
| **Likelihood** | Low |
| **Impact** | Low |
| **Risk Score** | LOW |

**Description:** Learners intentionally manipulate system for easier progression.

**Mitigation:** Anti-gaming detection, proctored assessments for certification

## 5. Risk Monitoring

### 5.1 Key Risk Indicators (KRIs)

| KRI | Threshold | Frequency |
|-----|-----------|-----------|
| Mastery prediction accuracy | < 85% | Weekly |
| Recommendation acceptance rate | < 60% | Weekly |
| Intervention override rate | > 50% | Weekly |
| Demographic parity ratio | < 0.8 | Monthly |
| User complaint rate | > 1% | Daily |

### 5.2 Review Schedule

| Review Type | Frequency | Responsible |
|-------------|-----------|-------------|
| Operational Review | Weekly | Engineering |
| Risk Assessment Update | Quarterly | AI Compliance Officer |
| External Audit | Annual | Third Party |
| Incident Review | As needed | Incident Response Team |

## 6. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| AI Compliance Officer | [TBD] | | |
| Engineering Lead | [TBD] | | |
| Legal Counsel | [TBD] | | |
| CEO | [TBD] | | |

## 7. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | LXD360 | Initial draft |
