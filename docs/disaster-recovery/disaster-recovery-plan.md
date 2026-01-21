# Disaster Recovery Plan

**Document ID:** DR-001
**Version:** 1.0.0
**Status:** DRAFT
**Effective Date:** TBD
**Owner:** Engineering Team

---

## 1. Purpose

This Disaster Recovery Plan (DRP) establishes procedures for recovering LXD360 platform operations following a service disruption, data loss event, or infrastructure failure.

## 2. Scope

This plan covers:
- Application services (Cloud Run)
- Data stores (Firestore, BigQuery, Cloud Storage)
- Authentication services (Firebase Auth)
- Third-party integrations (Stripe, Brevo)

## 3. Recovery Objectives

### 3.1 Recovery Time Objective (RTO)

Maximum acceptable downtime before business impact becomes critical.

| Service Tier | RTO | Services Included |
|--------------|-----|-------------------|
| **Tier 1** (Critical) | 1 hour | Authentication, Core API, Firestore reads |
| **Tier 2** (High) | 4 hours | Learning engine, xAPI LRS, Content delivery |
| **Tier 3** (Medium) | 8 hours | Analytics, Email notifications, Reports |
| **Tier 4** (Low) | 24 hours | Admin tools, Audit logs, Background jobs |

### 3.2 Recovery Point Objective (RPO)

Maximum acceptable data loss measured in time.

| Data Type | RPO | Backup Method |
|-----------|-----|---------------|
| User authentication | 0 (no loss) | Firebase Auth (managed) |
| Learning progress | 15 minutes | Firestore PITR |
| xAPI statements | 1 hour | BigQuery streaming + snapshots |
| User content | 1 hour | Cloud Storage versioning |
| Analytics data | 4 hours | BigQuery time travel |
| Audit logs | 24 hours | Daily exports |

### 3.3 Maximum Tolerable Downtime (MTD)

| Service | MTD | Business Impact |
|---------|-----|-----------------|
| Authentication | 4 hours | Complete platform inaccessibility |
| Learning Engine | 8 hours | Training completion blocked |
| Analytics | 24 hours | Reporting delayed |
| Admin Tools | 48 hours | Administrative functions unavailable |

## 4. Infrastructure Architecture

### 4.1 Primary Region

```
Region: us-central1 (Iowa)
├── Cloud Run (Application)
├── Firestore (Database)
├── Cloud Storage (Media)
├── Cloud Tasks (Background Jobs)
└── BigQuery (Analytics)
```

### 4.2 Failover Region (Planned)

```
Region: us-east1 (South Carolina)
├── Cloud Run (Secondary)
├── Firestore (Multi-region)
└── Cloud Storage (Cross-region replication)
```

### 4.3 External Services

| Service | Provider | SLA | Failover |
|---------|----------|-----|----------|
| Authentication | Firebase Auth | 99.95% | Google-managed |
| Payments | Stripe | 99.99% | Stripe-managed |
| Email | Brevo | 99.9% | Manual fallback |

## 5. Backup Procedures

### 5.1 Firestore

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Point-in-Time Recovery | Continuous | 7 days | Same region |
| Scheduled Export | Daily (02:00 UTC) | 30 days | gs://lxd360-backups/firestore/ |
| Monthly Archive | Monthly | 1 year | gs://lxd360-archive/firestore/ |

**Enable PITR:**
```bash
gcloud firestore databases update --database="(default)" \
  --enable-pitr \
  --project=lxd-saas-dev
```

**Scheduled Export Script:**
```bash
gcloud firestore export gs://lxd360-backups/firestore/$(date +%Y%m%d) \
  --project=lxd-saas-dev
```

### 5.2 Cloud Storage

| Configuration | Setting |
|---------------|---------|
| Object Versioning | Enabled |
| Lifecycle Policy | Delete versions > 30 days |
| Cross-Region Copy | us-central1 → us-east1 |

### 5.3 BigQuery

| Backup Type | Method | Retention |
|-------------|--------|-----------|
| Time Travel | Native | 7 days |
| Dataset Snapshot | Scheduled | 30 days |
| Archive Export | Monthly | 1 year |

## 6. Recovery Procedures

### 6.1 Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **SEV1** | Complete outage | 15 minutes | All services down |
| **SEV2** | Critical degradation | 30 minutes | Auth or database failure |
| **SEV3** | Partial degradation | 1 hour | Single service impaired |
| **SEV4** | Minor issue | 4 hours | Non-critical feature broken |

### 6.2 Incident Response Flow

```
Detection → Triage → Response → Recovery → Post-Incident
    ↓          ↓         ↓          ↓           ↓
 Alerting   Severity   Runbook   Restore    PIR Report
            Assign     Execute   Verify     Improvements
```

### 6.3 Cloud Run Recovery

**Scenario:** Application deployment failure or service crash

1. **Identify the issue:**
   ```bash
   gcloud run services logs read lxd360-app --region=us-central1 --limit=100
   ```

2. **Roll back to previous revision:**
   ```bash
   gcloud run services update-traffic lxd360-app \
     --to-revisions=PREVIOUS_REVISION=100 \
     --region=us-central1
   ```

3. **Verify service health:**
   ```bash
   curl https://lxd360-app-HASH.run.app/api/xapi/health
   ```

### 6.4 Firestore Recovery

**Scenario:** Data corruption or accidental deletion

**From PITR (Point-in-Time Recovery):**
```bash
gcloud firestore databases restore \
  --source-database="(default)" \
  --destination-database="restored-$(date +%Y%m%d)" \
  --snapshot-time="2026-01-20T12:00:00Z" \
  --project=lxd-saas-dev
```

**From Export:**
```bash
gcloud firestore import gs://lxd360-backups/firestore/20260120 \
  --project=lxd-saas-dev
```

### 6.5 Authentication Recovery

**Scenario:** Firebase Auth service issues

1. **Check Firebase Status:**
   - https://status.firebase.google.com/

2. **Enable maintenance mode:**
   - Set `MAINTENANCE_MODE=true` in environment
   - Display user-facing maintenance message

3. **If extended outage:**
   - Consider Google Identity Platform fallback
   - Communicate timeline to users

## 7. Communication Plan

### 7.1 Internal Communication

| Audience | Channel | Frequency |
|----------|---------|-----------|
| Engineering | Slack #incidents | Real-time |
| Leadership | Email + Slack | Every 30 min |
| Support | Slack #support | Every hour |

### 7.2 External Communication

| Audience | Channel | Trigger |
|----------|---------|---------|
| All Users | Status page | SEV1/SEV2 |
| Affected Users | In-app banner | SEV2+ |
| Enterprise | Direct email | Any impact |

### 7.3 Status Page Updates

Template for status updates:

```
[INVESTIGATING] We are investigating reports of [issue description].
[IDENTIFIED] The issue has been identified. [Brief explanation].
[MONITORING] A fix has been implemented. We are monitoring.
[RESOLVED] The incident has been resolved. [Duration and impact].
```

## 8. Testing & Drills

### 8.1 DR Drill Schedule

| Drill Type | Frequency | Scope |
|------------|-----------|-------|
| Tabletop Exercise | Monthly | Team discussion of scenarios |
| Backup Restore Test | Monthly | Verify backup integrity |
| Failover Test | Quarterly | Test regional failover |
| Full DR Drill | Annually | Complete recovery simulation |

### 8.2 Drill Checklist

- [ ] Notify stakeholders of drill
- [ ] Document start time
- [ ] Execute recovery procedures
- [ ] Verify service restoration
- [ ] Document actual recovery time
- [ ] Compare to RTO targets
- [ ] Identify improvements
- [ ] Update procedures as needed

## 9. Roles & Responsibilities

### 9.1 Incident Commander (IC)

- Overall incident coordination
- Communication with stakeholders
- Resource allocation decisions
- Declares incident resolved

### 9.2 Technical Lead

- Directs technical response
- Coordinates engineering team
- Approves recovery actions
- Documents technical timeline

### 9.3 Communications Lead

- Status page updates
- Customer communication
- Internal stakeholder updates
- Post-incident summary

## 10. Post-Incident Review

### 10.1 PIR Timeline

| Activity | Deadline |
|----------|----------|
| Draft PIR | 48 hours |
| PIR Meeting | 5 business days |
| Action Items | 7 business days |
| Follow-up Review | 30 days |

### 10.2 PIR Template

```markdown
## Post-Incident Review: [Incident Title]

**Date:** [Date]
**Duration:** [Start] to [End]
**Severity:** [SEV1/2/3/4]
**Services Affected:** [List]

### Summary
[Brief description of what happened]

### Timeline
| Time | Event |
|------|-------|
| HH:MM | [Event] |

### Root Cause
[Technical explanation]

### Impact
- Users affected: [Number]
- Data loss: [Yes/No, details]
- Financial impact: [If applicable]

### What Went Well
- [Item]

### What Could Be Improved
- [Item]

### Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| [Action] | [Name] | [Date] |
```

## 11. Document Maintenance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Review procedures | Quarterly | Engineering Lead |
| Update contacts | Monthly | Operations |
| Test runbooks | Quarterly | On-call team |
| Full plan review | Annually | Leadership |

## 12. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Engineering Lead | | | |
| CTO | | | |
| CEO | | | |

---

## Appendix A: Quick Reference Card

**During an Incident:**

1. **Don't Panic** - Follow the runbook
2. **Communicate** - Update #incidents channel
3. **Document** - Log all actions with timestamps
4. **Escalate** - If uncertain, escalate early
5. **Verify** - Confirm recovery before closing

**Key Commands:**
```bash
# Check service health
curl https://api.lxd360.io/api/xapi/health

# View recent logs
gcloud run services logs read lxd360-app --region=us-central1

# Roll back deployment
gcloud run services update-traffic lxd360-app --to-revisions=REVISION=100

# Restore Firestore
gcloud firestore databases restore --source-database="(default)" --snapshot-time="TIME"
```

---

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-20 | LXD360 | Initial draft |
