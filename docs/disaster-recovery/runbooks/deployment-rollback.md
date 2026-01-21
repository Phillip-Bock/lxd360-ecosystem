# Deployment Rollback Runbook

## Symptoms

- Application errors after recent deployment
- Performance degradation post-deployment
- Feature regression reported
- Health check failures on new revision

## Prerequisites

- GCP Console access
- `gcloud` CLI authenticated
- Cloud Run Admin permissions
- Access to deployment history

## Quick Assessment

```bash
# Check current traffic allocation
gcloud run services describe lxd360-app \
  --region=us-central1 \
  --format="value(status.traffic)"

# List recent revisions
gcloud run revisions list \
  --service=lxd360-app \
  --region=us-central1 \
  --sort-by="~creationTimestamp" \
  --limit=10

# Check health of current revision
curl -w "\n%{http_code}\n" https://api.lxd360.io/api/xapi/health
```

## Rollback Procedures

### Standard Rollback (< 5 minutes)

**Use when:** Immediate rollback needed, previous revision is known good

```bash
# 1. Identify the last known good (LKG) revision
gcloud run revisions list \
  --service=lxd360-app \
  --region=us-central1 \
  --format="table(name,creationTimestamp,active)"

# 2. Route 100% traffic to LKG revision
gcloud run services update-traffic lxd360-app \
  --to-revisions=lxd360-app-00042=100 \
  --region=us-central1

# 3. Verify rollback
curl https://api.lxd360.io/api/xapi/health

# 4. Monitor for stability
gcloud run services logs read lxd360-app --region=us-central1 --limit=20
```

### Gradual Rollback

**Use when:** Uncertainty about which revision is causing issues

```bash
# 1. Split traffic 50/50 between current and previous
gcloud run services update-traffic lxd360-app \
  --to-revisions=lxd360-app-00043=50,lxd360-app-00042=50 \
  --region=us-central1

# 2. Monitor both revisions
# Watch for error rate differences

# 3. If previous is better, shift to 100%
gcloud run services update-traffic lxd360-app \
  --to-revisions=lxd360-app-00042=100 \
  --region=us-central1
```

### Emergency Rollback

**Use when:** Critical production issue, need fastest possible rollback

```bash
# Single command rollback to previous revision
gcloud run services update-traffic lxd360-app \
  --to-latest=false \
  --region=us-central1

# This routes traffic away from the latest revision
```

## Post-Rollback Actions

### Verification Checklist

- [ ] Health endpoint returns 200
- [ ] Error rate returned to baseline
- [ ] Key user flows working
- [ ] No new errors in logs
- [ ] Performance metrics normal

### Investigation

1. **Compare revisions:**
   ```bash
   # Get deployment details
   gcloud run revisions describe lxd360-app-00043 \
     --region=us-central1 \
     --format=yaml > broken_revision.yaml

   gcloud run revisions describe lxd360-app-00042 \
     --region=us-central1 \
     --format=yaml > working_revision.yaml

   diff broken_revision.yaml working_revision.yaml
   ```

2. **Check build logs:**
   ```bash
   gcloud builds list --limit=5
   gcloud builds log BUILD_ID
   ```

3. **Review code changes:**
   - Check git log for recent commits
   - Review PR that introduced the issue
   - Check for missing environment variables

### Communication

1. Update #incidents with rollback status
2. Notify stakeholders
3. Document root cause when found

## Preventing Future Issues

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Lint/typecheck passing
- [ ] Build successful locally
- [ ] Environment variables verified
- [ ] Database migrations run (if any)
- [ ] Canary deployment tested

### Deployment Best Practices

1. **Use gradual rollouts:**
   ```bash
   # Deploy with only 10% traffic
   gcloud run deploy lxd360-app \
     --source . \
     --region=us-central1 \
     --tag=canary

   # Route 10% to canary
   gcloud run services update-traffic lxd360-app \
     --to-tags=canary=10 \
     --region=us-central1
   ```

2. **Set minimum instances:**
   ```bash
   # Keep at least one instance warm
   gcloud run services update lxd360-app \
     --min-instances=1 \
     --region=us-central1
   ```

3. **Use health checks:**
   - Ensure `/api/xapi/health` covers all critical dependencies
   - Cloud Run uses health checks for traffic routing

## Troubleshooting

### Rollback Command Fails

```bash
# Check if revision still exists
gcloud run revisions list --service=lxd360-app --region=us-central1

# If revision was deleted, redeploy from git tag
git checkout v1.2.3
gcloud run deploy lxd360-app --source . --region=us-central1
```

### Previous Revision Also Broken

```bash
# Keep going back in revision history
gcloud run revisions list \
  --service=lxd360-app \
  --region=us-central1 \
  --sort-by="~creationTimestamp"

# Or enable maintenance mode
gcloud run services update lxd360-app \
  --set-env-vars="MAINTENANCE_MODE=true" \
  --region=us-central1
```

### Environment Variable Issues

```bash
# Compare env vars between revisions
gcloud run revisions describe lxd360-app-00043 \
  --region=us-central1 \
  --format="value(spec.containers[0].env)"

gcloud run revisions describe lxd360-app-00042 \
  --region=us-central1 \
  --format="value(spec.containers[0].env)"

# Check Secret Manager for changes
gcloud secrets versions list SECRET_NAME
```

## Escalation

**Escalate if:**
- Rollback doesn't resolve the issue
- No known good revision available
- Data integrity concerns
- Unclear root cause after 30 minutes

**Contacts:**
- Engineering Lead: engineering-lead@lxd360.com
- CTO (for extended outages): cto@lxd360.com

---

**Last Updated:** January 2026
**Owner:** Engineering Team
