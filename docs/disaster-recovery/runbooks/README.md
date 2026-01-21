# Operational Runbooks

This directory contains runbooks for common incident scenarios.

## Runbook Index

| Runbook | Scenario |
|---------|----------|
| [service-outage.md](./service-outage.md) | Complete or partial service unavailability |
| [database-recovery.md](./database-recovery.md) | Firestore/BigQuery data issues |
| [security-incident.md](./security-incident.md) | Security-related incidents |
| [deployment-rollback.md](./deployment-rollback.md) | Failed deployment recovery |

## Using Runbooks

1. **Identify the scenario** that matches your incident
2. **Follow the steps** in order
3. **Document your actions** with timestamps
4. **Escalate** if the runbook doesn't resolve the issue
5. **Update the runbook** if you discover improvements

## Runbook Template

When creating new runbooks, use this template:

```markdown
# [Scenario Name]

## Symptoms
- What you'll observe

## Prerequisites
- Required access and tools

## Steps
1. Step one
2. Step two

## Verification
- How to confirm resolution

## Escalation
- When and how to escalate
```
