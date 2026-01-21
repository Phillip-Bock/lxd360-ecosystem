# Security Incident Runbook

## Symptoms

- Unauthorized access attempts detected
- Suspicious activity in audit logs
- Data breach reported or suspected
- Credentials potentially compromised
- Malware or vulnerability exploited

## Prerequisites

- Security team access
- GCP Console with Security Command Center access
- Firebase Console access
- Ability to revoke credentials and sessions

## STOP - Read First

**Security incidents require careful handling:**

1. **Do not alert the attacker** - Avoid actions that could tip off an active threat
2. **Preserve evidence** - Document before making changes
3. **Follow the chain of custody** - All evidence handling must be documented
4. **Involve security/legal early** - Don't wait until you're sure

## Incident Classification

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **Critical** | Active data breach, widespread compromise | Immediate |
| **High** | Confirmed unauthorized access, vulnerability exploited | < 1 hour |
| **Medium** | Suspicious activity, potential exposure | < 4 hours |
| **Low** | Minor policy violation, no data exposure | < 24 hours |

## Immediate Response

### Step 1: Assess and Document

```markdown
## Security Incident Report

**Date/Time Detected:** [timestamp]
**Detected By:** [person/system]
**Initial Assessment:**

### What We Know
- [Fact 1]
- [Fact 2]

### What We Don't Know
- [Unknown 1]
- [Unknown 2]

### Systems Potentially Affected
- [ ] Firebase Auth
- [ ] Firestore
- [ ] Cloud Storage
- [ ] Application servers
- [ ] Third-party services
```

### Step 2: Contain

**Priority: Stop the bleeding without destroying evidence**

```bash
# If credentials are compromised - revoke sessions
# Firebase Auth: Revoke user's refresh tokens
firebase auth:import --project=lxd-saas-dev

# If API key compromised - rotate immediately
# GCP Console > APIs & Services > Credentials

# If service account compromised
gcloud iam service-accounts keys list --iam-account=SERVICE_ACCOUNT
gcloud iam service-accounts keys delete KEY_ID --iam-account=SERVICE_ACCOUNT
```

### Step 3: Notify

**Immediate notifications:**
- Security team: security@lxd360.com
- Engineering Lead: engineering-lead@lxd360.com
- CTO: cto@lxd360.com (for Critical/High)

**Do NOT publicly disclose** until:
- Scope is understood
- Legal has been consulted
- Communication plan is ready

## Investigation Procedures

### Collecting Evidence

```bash
# Export Cloud Run logs
gcloud logging read \
  'resource.type="cloud_run_revision"' \
  --project=lxd-saas-dev \
  --format=json \
  --freshness=7d > cloud_run_logs.json

# Export Firestore audit logs
gcloud logging read \
  'protoPayload.serviceName="firestore.googleapis.com"' \
  --project=lxd-saas-dev \
  --format=json \
  --freshness=7d > firestore_audit.json

# Export Firebase Auth logs
gcloud logging read \
  'protoPayload.serviceName="identitytoolkit.googleapis.com"' \
  --project=lxd-saas-dev \
  --format=json \
  --freshness=7d > auth_logs.json
```

### Analyzing Access Patterns

```bash
# Find unusual access patterns
gcloud logging read \
  'httpRequest.status>=400' \
  --project=lxd-saas-dev \
  --format="table(timestamp,httpRequest.requestUrl,httpRequest.status,httpRequest.remoteIp)"

# Look for privilege escalation attempts
gcloud logging read \
  'protoPayload.methodName:"SetIamPolicy"' \
  --project=lxd-saas-dev \
  --format=json
```

### Checking for Data Exfiltration

```bash
# Large data reads
gcloud logging read \
  'protoPayload.serviceName="firestore.googleapis.com" AND protoPayload.methodName="RunQuery"' \
  --project=lxd-saas-dev \
  --format=json

# Cloud Storage access patterns
gcloud logging read \
  'resource.type="gcs_bucket"' \
  --project=lxd-saas-dev \
  --format=json
```

## Specific Incident Types

### A: Compromised User Account

1. **Identify affected account**
2. **Disable the account:**
   ```bash
   # Firebase Console > Authentication > Users > Disable
   ```
3. **Revoke all sessions:**
   ```typescript
   import { getAuth } from 'firebase-admin/auth';
   await getAuth().revokeRefreshTokens(userId);
   ```
4. **Review account activity:**
   - Check audit logs for user actions
   - Identify data accessed
5. **Notify user** (after containment)
6. **Reset credentials** with verification

### B: Compromised API Key

1. **Identify which key:**
   - Firebase API key (client-side, limited risk)
   - GCP service account key (high risk)
   - Third-party API key (varies)

2. **Rotate immediately:**
   ```bash
   # GCP Console > APIs & Services > Credentials
   # Create new key, update deployment, delete old key
   ```

3. **Update all deployments:**
   ```bash
   # Update Secret Manager
   gcloud secrets versions add API_KEY --data-file=new_key.txt

   # Redeploy application
   gcloud run deploy lxd360-app --region=us-central1
   ```

4. **Audit usage:**
   - Check logs for unauthorized API calls
   - Identify scope of potential access

### C: Data Breach

1. **Determine scope:**
   - What data types affected?
   - How many users affected?
   - What time period?

2. **Preserve evidence:**
   - Export all relevant logs
   - Snapshot affected systems
   - Document timeline

3. **Engage legal:**
   - Determine notification requirements (GDPR: 72 hours)
   - Prepare breach notification

4. **Contain:**
   - Block attack vector
   - Patch vulnerability
   - Reset affected credentials

5. **Notify:**
   - Regulators (if required)
   - Affected users
   - Business partners (if their data affected)

### D: Malware/Vulnerability

1. **Isolate affected systems:**
   ```bash
   # Take service offline if necessary
   gcloud run services update-traffic lxd360-app --to-revisions=maintenance=100
   ```

2. **Identify the vulnerability:**
   - Check CVE databases
   - Review dependency versions
   - Analyze attack vector

3. **Patch:**
   ```bash
   # Update vulnerable dependency
   npm audit fix

   # Or specific package
   npm install package@patched-version
   ```

4. **Deploy fix:**
   ```bash
   gcloud run deploy lxd360-app --region=us-central1
   ```

5. **Verify remediation:**
   - Run security scans
   - Verify vulnerability is patched

## Recovery

### After Containment

- [ ] All attack vectors closed
- [ ] Compromised credentials rotated
- [ ] Affected users notified
- [ ] Systems patched
- [ ] Evidence preserved

### Return to Service

- [ ] Security review complete
- [ ] Additional monitoring in place
- [ ] Incident documented
- [ ] Stakeholders notified

## Post-Incident

### Within 24 Hours

- Complete incident timeline
- Identify root cause
- Document lessons learned

### Within 72 Hours

- Post-incident review meeting
- Determine notification requirements
- Begin remediation tasks

### Within 30 Days

- Implement preventive measures
- Update security documentation
- Complete any required notifications
- Close incident formally

## Regulatory Considerations

| Regulation | Notification Requirement |
|------------|--------------------------|
| GDPR | 72 hours to supervisory authority |
| CCPA | "Without unreasonable delay" |
| HIPAA | 60 days (if applicable) |
| State laws | Varies by state |

**Always consult legal before any external notification.**

## Contacts

| Role | Contact | When |
|------|---------|------|
| Security Team | security@lxd360.com | All incidents |
| Engineering Lead | engineering-lead@lxd360.com | All incidents |
| CTO | cto@lxd360.com | High/Critical |
| Legal | legal@lxd360.com | Any data breach |
| CEO | ceo@lxd360.com | PR-sensitive incidents |

---

**Last Updated:** January 2026
**Owner:** Security Team
