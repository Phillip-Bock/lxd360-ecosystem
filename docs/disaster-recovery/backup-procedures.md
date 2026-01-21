# Backup Procedures

**Document ID:** DR-002
**Version:** 1.0.0
**Status:** DRAFT
**Owner:** Engineering Team

---

## 1. Overview

This document details the backup procedures for all LXD360 data stores and the corresponding restoration procedures.

## 2. Backup Schedule Summary

| Data Store | Backup Type | Frequency | Retention | Location |
|------------|-------------|-----------|-----------|----------|
| Firestore | PITR | Continuous | 7 days | Same region |
| Firestore | Export | Daily | 30 days | Cloud Storage |
| Firestore | Archive | Monthly | 1 year | Archive bucket |
| BigQuery | Time Travel | Continuous | 7 days | Native |
| BigQuery | Snapshot | Weekly | 90 days | Same dataset |
| Cloud Storage | Versioning | Continuous | 30 days | Same bucket |
| Cloud Storage | Cross-region | Continuous | Same | Secondary region |

## 3. Firestore Backup Procedures

### 3.1 Point-in-Time Recovery (PITR)

PITR allows recovery to any point within the last 7 days.

**Enable PITR:**
```bash
gcloud firestore databases update --database="(default)" \
  --enable-pitr \
  --project=lxd-saas-dev
```

**Verify PITR Status:**
```bash
gcloud firestore databases describe --database="(default)" \
  --project=lxd-saas-dev
```

### 3.2 Scheduled Exports

**Daily Export (Cloud Scheduler):**

Create a Cloud Function triggered by Cloud Scheduler at 02:00 UTC daily:

```typescript
// functions/backup-firestore.ts
import { Firestore } from '@google-cloud/firestore';

export async function backupFirestore(): Promise<void> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const bucket = `gs://lxd360-backups/firestore`;
  const timestamp = new Date().toISOString().split('T')[0];

  const firestore = new Firestore({ projectId });

  await firestore.exportDocuments({
    outputUriPrefix: `${bucket}/${timestamp}`,
    collectionIds: [], // Empty = all collections
  });

  console.log(`Backup exported to ${bucket}/${timestamp}`);
}
```

**Manual Export:**
```bash
gcloud firestore export gs://lxd360-backups/firestore/$(date +%Y%m%d) \
  --project=lxd-saas-dev
```

### 3.3 Backup Verification

**Weekly verification script:**

```bash
#!/bin/bash
# scripts/verify-backup.sh

BUCKET="gs://lxd360-backups/firestore"
LATEST=$(gsutil ls $BUCKET | tail -1)

echo "Verifying backup: $LATEST"

# Check backup metadata
gsutil cat "${LATEST}all_namespaces/all_kinds/output-0" | head -10

# Verify file count
FILE_COUNT=$(gsutil ls -r $LATEST | wc -l)
echo "Files in backup: $FILE_COUNT"

if [ $FILE_COUNT -lt 10 ]; then
  echo "WARNING: Backup may be incomplete"
  exit 1
fi

echo "Backup verification complete"
```

## 4. Firestore Restoration Procedures

### 4.1 Restore from PITR

**Restore to a new database:**
```bash
gcloud firestore databases restore \
  --source-database="(default)" \
  --destination-database="restored-db" \
  --snapshot-time="2026-01-20T12:00:00Z" \
  --project=lxd-saas-dev
```

**Verify restoration:**
```bash
gcloud firestore operations list --database="restored-db"
```

### 4.2 Restore from Export

**Import to existing database:**
```bash
gcloud firestore import gs://lxd360-backups/firestore/20260120 \
  --project=lxd-saas-dev
```

**Import specific collections:**
```bash
gcloud firestore import gs://lxd360-backups/firestore/20260120 \
  --collection-ids=users,organizations,courses \
  --project=lxd-saas-dev
```

### 4.3 Partial Data Recovery

For recovering specific documents:

1. Import backup to a temporary database
2. Query the specific documents needed
3. Copy documents to production database
4. Delete temporary database

```typescript
// scripts/partial-restore.ts
import { Firestore } from '@google-cloud/firestore';

async function restoreDocument(
  sourceDb: string,
  targetDb: string,
  collection: string,
  docId: string
): Promise<void> {
  const sourceFirestore = new Firestore({ databaseId: sourceDb });
  const targetFirestore = new Firestore({ databaseId: targetDb });

  const doc = await sourceFirestore.collection(collection).doc(docId).get();

  if (doc.exists) {
    await targetFirestore.collection(collection).doc(docId).set(doc.data()!);
    console.log(`Restored ${collection}/${docId}`);
  }
}
```

## 5. BigQuery Backup Procedures

### 5.1 Time Travel Recovery

BigQuery maintains 7 days of time travel by default.

**Query historical data:**
```sql
SELECT *
FROM `lxd-saas-dev.xapi.statements`
FOR SYSTEM_TIME AS OF TIMESTAMP('2026-01-19 12:00:00 UTC')
WHERE actor_mbox = 'mailto:user@example.com';
```

**Create table from historical point:**
```sql
CREATE OR REPLACE TABLE `lxd-saas-dev.xapi.statements_restored`
AS SELECT *
FROM `lxd-saas-dev.xapi.statements`
FOR SYSTEM_TIME AS OF TIMESTAMP('2026-01-19 12:00:00 UTC');
```

### 5.2 Dataset Snapshots

**Create snapshot:**
```bash
bq cp --snapshot lxd-saas-dev:xapi lxd-saas-dev:xapi_snapshot_$(date +%Y%m%d)
```

**Restore from snapshot:**
```bash
bq cp --restore lxd-saas-dev:xapi_snapshot_20260120 lxd-saas-dev:xapi_restored
```

### 5.3 Export to Cloud Storage

**Export table:**
```bash
bq extract \
  --destination_format=NEWLINE_DELIMITED_JSON \
  --compression=GZIP \
  lxd-saas-dev:xapi.statements \
  gs://lxd360-backups/bigquery/statements_$(date +%Y%m%d)_*.json.gz
```

## 6. Cloud Storage Backup Procedures

### 6.1 Object Versioning

**Enable versioning:**
```bash
gsutil versioning set on gs://lxd360-media
```

**List object versions:**
```bash
gsutil ls -a gs://lxd360-media/path/to/file
```

**Restore previous version:**
```bash
gsutil cp gs://lxd360-media/path/to/file#VERSION gs://lxd360-media/path/to/file
```

### 6.2 Cross-Region Replication

**Set up dual-region bucket:**
```bash
gsutil mb -l US-CENTRAL1+US-EAST1 gs://lxd360-media-replicated
```

**Or use Transfer Service for existing buckets:**
```bash
gcloud transfer jobs create \
  gs://lxd360-media \
  gs://lxd360-media-backup \
  --schedule-starts="2026-01-21T02:00:00Z" \
  --schedule-repeats-every="P1D"
```

### 6.3 Lifecycle Policies

**lifecycle.json:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 5,
          "isLive": false
        }
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {
          "age": 30,
          "matchesStorageClass": ["STANDARD"]
        }
      }
    ]
  }
}
```

**Apply lifecycle policy:**
```bash
gsutil lifecycle set lifecycle.json gs://lxd360-media
```

## 7. Backup Monitoring

### 7.1 Alerting Policies

Create Cloud Monitoring alerts for:

1. **Missing daily backup:**
   - Check for new objects in backup bucket
   - Alert if no backup in 24 hours

2. **Backup size anomaly:**
   - Compare backup size to previous
   - Alert if < 50% or > 200% of normal

3. **Backup verification failure:**
   - Monitor verification script output
   - Alert on any failure

### 7.2 Backup Dashboard

Key metrics to monitor:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Last backup age | < 24 hours | > 26 hours |
| Backup size | Stable | ±50% change |
| Verification status | Pass | Any failure |
| PITR coverage | 7 days | < 7 days |

## 8. Backup Testing Schedule

| Test Type | Frequency | Procedure |
|-----------|-----------|-----------|
| Backup verification | Weekly | Run verification script |
| Single doc restore | Monthly | Restore random document |
| Collection restore | Quarterly | Restore test collection |
| Full DR restore | Annually | Complete database restore |

### 8.1 Monthly Restore Test Procedure

1. Select random collection from backup
2. Restore to test environment
3. Verify data integrity
4. Document restoration time
5. Delete test restoration
6. Update procedures if needed

## 9. Retention and Cleanup

### 9.1 Retention Policy

| Backup Type | Retention | Cleanup Method |
|-------------|-----------|----------------|
| Daily exports | 30 days | Lifecycle policy |
| Weekly snapshots | 90 days | Scheduled deletion |
| Monthly archives | 1 year | Manual review |
| Annual archives | 7 years | Compliance hold |

### 9.2 Cleanup Script

```bash
#!/bin/bash
# scripts/cleanup-old-backups.sh

BUCKET="gs://lxd360-backups/firestore"
RETENTION_DAYS=30

# List and delete backups older than retention
gsutil ls $BUCKET | while read backup; do
  BACKUP_DATE=$(basename $backup)
  BACKUP_EPOCH=$(date -d $BACKUP_DATE +%s 2>/dev/null)
  CUTOFF_EPOCH=$(date -d "-${RETENTION_DAYS} days" +%s)

  if [ "$BACKUP_EPOCH" -lt "$CUTOFF_EPOCH" ]; then
    echo "Deleting old backup: $backup"
    gsutil -m rm -r $backup
  fi
done
```

## 10. Compliance Requirements

### 10.1 Data Retention (Regulatory)

| Data Type | Minimum Retention | Regulation |
|-----------|-------------------|------------|
| Learning records | 7 years | Industry standard |
| Financial records | 7 years | Tax/audit |
| User consent | Duration of account + 3 years | GDPR |
| Audit logs | 7 years | SOC 2 |

### 10.2 Backup Encryption

All backups are encrypted:
- At rest: Google-managed encryption keys
- In transit: TLS 1.3
- Option: Customer-managed keys (CMEK) for compliance

---

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-20 | LXD360 | Initial draft |
