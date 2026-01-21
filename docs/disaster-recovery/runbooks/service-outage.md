# Service Outage Runbook

## Symptoms

- Users unable to access platform
- Health check endpoint returning 5xx errors
- Monitoring alerts for service unavailability
- Error rate spike in Cloud Run metrics

## Prerequisites

- GCP Console access
- `gcloud` CLI authenticated
- Access to #incidents Slack channel
- PagerDuty mobile app (for escalation)

## Quick Assessment

```bash
# Check service status
gcloud run services describe lxd360-app --region=us-central1 --format="value(status.conditions)"

# Check recent logs (last 5 minutes)
gcloud run services logs read lxd360-app --region=us-central1 --limit=50

# Check health endpoint
curl -w "\n%{http_code}\n" https://api.lxd360.io/api/xapi/health
```

## Diagnosis Steps

### 1. Identify the Scope

| Check | Command/Action |
|-------|----------------|
| Cloud Run status | GCP Console > Cloud Run > lxd360-app |
| Firebase Auth | https://status.firebase.google.com/ |
| Firestore | GCP Console > Firestore > Data |
| External status | https://status.cloud.google.com/ |

### 2. Check Cloud Run Revisions

```bash
# List revisions
gcloud run revisions list --service=lxd360-app --region=us-central1

# Check current traffic allocation
gcloud run services describe lxd360-app --region=us-central1 --format="value(status.traffic)"
```

### 3. Review Error Logs

```bash
# Filter for errors
gcloud run services logs read lxd360-app \
  --region=us-central1 \
  --filter="severity>=ERROR" \
  --limit=100
```

## Resolution Procedures

### Scenario A: Bad Deployment

**Symptoms:** Outage started after recent deployment

```bash
# 1. List recent revisions
gcloud run revisions list --service=lxd360-app --region=us-central1

# 2. Identify last known good revision (LKG)
# Look for revision before the deployment time

# 3. Roll back to LKG
gcloud run services update-traffic lxd360-app \
  --to-revisions=lxd360-app-REVISION=100 \
  --region=us-central1

# 4. Verify
curl https://api.lxd360.io/api/xapi/health
```

### Scenario B: Resource Exhaustion

**Symptoms:** Memory or CPU limits exceeded in logs

```bash
# 1. Check current limits
gcloud run services describe lxd360-app \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].resources)"

# 2. Increase resources temporarily
gcloud run services update lxd360-app \
  --region=us-central1 \
  --memory=2Gi \
  --cpu=2

# 3. Monitor for stabilization
gcloud run services logs read lxd360-app --region=us-central1 --limit=20
```

### Scenario C: Dependency Failure

**Symptoms:** Logs show connection errors to Firebase, Stripe, etc.

1. **Check dependency status pages:**
   - Firebase: https://status.firebase.google.com/
   - Stripe: https://status.stripe.com/
   - GCP: https://status.cloud.google.com/

2. **If Firebase is down:**
   - Enable maintenance mode if available
   - Communicate to users
   - Wait for Firebase resolution

3. **If Stripe is down:**
   - Payment features will fail
   - Core platform should remain accessible
   - Communicate payment delays to users

### Scenario D: DNS/SSL Issues

**Symptoms:** SSL errors, domain not resolving

```bash
# Check DNS resolution
dig api.lxd360.io

# Check SSL certificate
openssl s_client -connect api.lxd360.io:443 -servername api.lxd360.io

# Check Cloud Run domain mapping
gcloud run domain-mappings list --region=us-central1
```

## Post-Resolution

### Verification Checklist

- [ ] Health endpoint returns 200
- [ ] Users can log in
- [ ] Core features working (spot check)
- [ ] Error rate returned to baseline
- [ ] No new errors in logs

### Communication

1. Update #incidents channel with resolution
2. Update status page
3. Notify stakeholders
4. Schedule post-incident review

## Escalation

**Escalate if:**
- Outage persists > 30 minutes
- Root cause unclear
- Multiple systems affected
- Customer data may be impacted

**Escalation contacts:**
- Engineering Lead: engineering-lead@lxd360.com
- CTO (SEV1 only): cto@lxd360.com

## Related Runbooks

- [database-recovery.md](./database-recovery.md) - For Firestore issues
- [deployment-rollback.md](./deployment-rollback.md) - Detailed rollback procedures
- [security-incident.md](./security-incident.md) - If security-related

---

**Last Updated:** January 2026
**Owner:** Engineering Team
