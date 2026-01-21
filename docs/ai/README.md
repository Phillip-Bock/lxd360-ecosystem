# LXD360 AI Systems Documentation

**EU AI Act Compliance Documentation Package**

This directory contains technical documentation required for EU AI Act Article 11 compliance as a High-Risk AI System under Annex III, Category 3(a) - Educational AI Systems.

## Regulatory Classification

| Field | Value |
|-------|-------|
| **Regulation** | EU AI Act (Regulation 2024/1689) |
| **Classification** | High-Risk AI System |
| **Annex Reference** | Annex III, Category 3(a) |
| **Compliance Deadline** | August 2, 2026 |
| **Document Version** | 1.0.0 |
| **Last Updated** | 2026-01-19 |

## Document Structure

```
docs/ai/
├── README.md                    # This file
├── risk-management/             # Article 9 - Risk Management
│   ├── risk-assessment.md       # Risk identification and analysis
│   ├── risk-mitigation.md       # Mitigation measures
│   └── residual-risks.md        # Accepted residual risks
├── data-governance/             # Article 10 - Data Governance
│   ├── training-data.md         # Training data documentation
│   ├── data-quality.md          # Quality metrics
│   └── bias-assessment.md       # Bias analysis
├── technical/                   # Article 11 - Technical Documentation
│   ├── system-overview.md       # High-level system description
│   ├── architecture.md          # System architecture
│   ├── algorithms/              # Algorithm documentation
│   │   ├── bkt.md               # Bayesian Knowledge Tracing
│   │   ├── sm2.md               # SuperMemo 2 spaced repetition
│   │   └── cognitive-load.md    # Cognitive load detection
│   ├── validation-testing.md    # Testing procedures
│   └── performance-metrics.md   # Performance benchmarks
├── operations/                  # Articles 13-14 - Transparency & Oversight
│   ├── human-oversight.md       # Human oversight mechanisms
│   ├── instructions-for-use.md  # User documentation
│   └── maintenance-updates.md   # Update procedures
├── compliance/                  # Articles 12, 72 - Records & Monitoring
│   ├── audit-log-retention.md   # Log retention policy
│   ├── post-market-monitoring.md# Monitoring plan
│   └── incident-response.md     # Incident procedures
└── providers/                   # GPAI Provider Documentation
    ├── google-vertex.md         # Google Vertex AI / Gemini
    ├── anthropic.md             # Anthropic Claude
    └── openai.md                # OpenAI GPT models
```

## Quick Reference

### AI Systems Documented

| System | Purpose | Risk Level | Documentation |
|--------|---------|------------|---------------|
| BKT Engine | Mastery prediction | High | [algorithms/bkt.md](technical/algorithms/bkt.md) |
| SM-2 Scheduler | Spaced repetition | Medium | [algorithms/sm2.md](technical/algorithms/sm2.md) |
| Cognitive Load | Learner state detection | Medium | [algorithms/cognitive-load.md](technical/algorithms/cognitive-load.md) |
| Content Recommender | Learning path suggestions | High | [system-overview.md](technical/system-overview.md) |
| Intervention System | Adaptive support | High | [human-oversight.md](operations/human-oversight.md) |

### Compliance Status

| Article | Requirement | Status |
|---------|-------------|--------|
| Article 9 | Risk Management | In Progress |
| Article 10 | Data Governance | In Progress |
| Article 11 | Technical Documentation | In Progress |
| Article 12 | Record-Keeping | In Progress |
| Article 13 | Transparency | In Progress |
| Article 14 | Human Oversight | Implemented |
| Article 15 | Accuracy & Robustness | In Progress |
| Article 72 | Post-Market Monitoring | In Progress |

## Contact

**AI Compliance Officer:** [To be assigned]
**Technical Lead:** LXD360 Engineering
**Legal Review:** [To be assigned]

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | LXD360 | Initial documentation structure |
