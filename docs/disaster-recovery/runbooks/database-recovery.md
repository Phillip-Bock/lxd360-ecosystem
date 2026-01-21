# Database Recovery Runbook

## Symptoms

- Application errors related to Firestore
- Missing or corrupted data reported
- Database read/write failures
- BigQuery query failures

## Prerequisites

- GCP Console access with Firestore Admin role
- `gcloud` CLI authenticated
- `bq` command-line tool
- Access to backup bucket (gs://lxd360-backups/)

## Quick Assessment

```bash
# Check Firestore status
gcloud firestore operations list --limit=10

# Verify database is accessible
gcloud firestore databases describe --database="(default)"

# Check BigQuery status
bq show --format=prettyjson lxd-saas-dev:xapi
```

## Diagnosis Steps

### 1. Identify the Issue Type

| Issue | Indicators |
|-------|------------|
| Connection failure | Timeout errors, "unavailable" status |
| Missing documents | 404 errors for known documents |
| Data corruption | Unexpected values, validation failures |
| Permission issues | 403 errors, "permission denied" |

### 2. Check Recent Operations

```bash
# Recent Firestore operations
gcloud firestore operations list --limit=20

# Check for any running imports/exports
gcloud firestore operations list --filter="metadata.operationType=EXPORT_DOCUMENTS"
```

### 3. Review Application Logs

```bash
# Filter for Firestore errors
gcloud run services logs read lxd360-app \
  --region=us-central1 \
  --filter="textPayload:firestore OR textPayload:Firestore" \
  --limit=50
```

## Recovery Procedures

### Scenario A: Point-in-Time Recovery (PITR)

**Use when:** Data was accidentally deleted/modified within last 7 days

```bash
# 1. Determine the recovery timestamp
# (before the data loss occurred)

# 2. Create restored database from PITR
gcloud firestore databases restore \
  --source-database="(default)" \
  --destination-database="restored-$(date +%Y%m%d-%H%M)" \
  --snapshot-time="2026-01-20T10:00:00Z" \
  --project=lxd-saas-dev

# 3. Wait for restore to complete
gcloud firestore operations list --database="restored-$(date +%Y%m%d-%H%M)"

# 4. Verify restored data
# (Use Firebase Console or custom script to check specific documents)

# 5. If verified, migrate data back to production
# (Manual process - copy specific collections/documents)
```

### Scenario B: Restore from Export

**Use when:** PITR not available or data loss > 7 days

```bash
# 1. List available backups
gsutil ls gs://lxd360-backups/firestore/

# 2. Choose appropriate backup
BACKUP_PATH="gs://lxd360-backups/firestore/20260120"

# 3. Import to production (CAUTION: may overwrite data)
gcloud firestore import $BACKUP_PATH --project=lxd-saas-dev

# OR import to separate database first for verification
gcloud firestore databases create --database="restore-verify" --location=us-central1
gcloud firestore import $BACKUP_PATH --database="restore-verify"
```

### Scenario C: Recover Specific Documents

**Use when:** Only specific documents need recovery

```typescript
// scripts/recover-documents.ts
import { Firestore } from '@google-cloud/firestore';

async function recoverDocument(
  sourceDb: string,
  collection: string,
  docId: string
): Promise<void> {
  const source = new Firestore({ databaseId: sourceDb });
  const target = new Firestore(); // Default database

  const doc = await source.collection(collection).doc(docId).get();

  if (!doc.exists) {
    console.error(`Document ${collection}/${docId} not found in source`);
    return;
  }

  // Backup current production document first
  const currentDoc = await target.collection(collection).doc(docId).get();
  if (currentDoc.exists) {
    await target.collection('_recovery_backup').doc(`${collection}_${docId}`).set({
      originalData: currentDoc.data(),
      recoveredAt: new Date(),
    });
  }

  // Restore from backup
  await target.collection(collection).doc(docId).set(doc.data()!);
  console.log(`Recovered ${collection}/${docId}`);
}
```

### Scenario D: BigQuery Recovery

**Use when:** BigQuery data issues

```sql
-- Check table exists
SELECT table_name FROM `lxd-saas-dev.xapi.INFORMATION_SCHEMA.TABLES`;

-- Use time travel to query historical data
SELECT *
FROM `lxd-saas-dev.xapi.statements`
FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
WHERE id = 'specific-statement-id';

-- Restore table from time travel
CREATE OR REPLACE TABLE `lxd-saas-dev.xapi.statements`
AS SELECT *
FROM `lxd-saas-dev.xapi.statements`
FOR SYSTEM_TIME AS OF TIMESTAMP('2026-01-20T10:00:00Z');
```

### Scenario E: Permission Issues

**Use when:** Seeing permission denied errors

```bash
# Check service account permissions
gcloud projects get-iam-policy lxd-saas-dev \
  --filter="bindings.members:*compute@developer.gserviceaccount.com" \
  --format="table(bindings.role)"

# Grant Firestore access if missing
gcloud projects add-iam-policy-binding lxd-saas-dev \
  --member="serviceAccount:SERVICE_ACCOUNT@lxd-saas-dev.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

## Data Verification

After any recovery, verify data integrity:

```bash
# Count documents in key collections
firebase firestore:get users --limit=1 --project=lxd-saas-dev
firebase firestore:get organizations --limit=1 --project=lxd-saas-dev

# Run verification script
npm run verify:database
```

### Verification Checklist

- [ ] Users collection accessible
- [ ] Organizations collection accessible
- [ ] Recent data present (check timestamps)
- [ ] Sample user can log in
- [ ] Sample course loads correctly

## Post-Recovery

1. **Document the incident:**
   - What data was affected
   - Recovery method used
   - Time to recovery

2. **Verify application function:**
   - Test critical user flows
   - Check for cascade effects

3. **Communicate:**
   - Update stakeholders
   - Notify affected users if applicable

## Prevention

- Enable PITR if not already active
- Verify daily backup completion
- Test restoration monthly
- Implement soft-delete for critical data

## Escalation

**Escalate if:**
- Recovery procedure fails
- Data loss scope unknown
- Multiple collections affected
- Customer data may be lost

**Contacts:**
- Engineering Lead: engineering-lead@lxd360.com
- GCP Support: Cloud Console support case

---

**Last Updated:** January 2026
**Owner:** Engineering Team
