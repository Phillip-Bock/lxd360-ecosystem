# Access Control Policy

**Policy ID:** POL-004
**Version:** 1.0.0
**Status:** DRAFT
**Effective Date:** TBD
**Owner:** Chief Information Security Officer

---

## 1. Purpose

This policy establishes requirements for controlling access to LXD360 information systems and data based on the principle of least privilege.

## 2. Scope

This policy applies to:
- All employees, contractors, and third parties with system access
- All LXD360 information systems and applications
- All data stored, processed, or transmitted by LXD360

## 3. Policy Statements

### 3.1 Principle of Least Privilege

- Users shall be granted the minimum access necessary to perform job functions
- Access rights shall be reviewed when roles change
- Temporary elevated access requires documented approval

### 3.2 Role-Based Access Control (RBAC)

LXD360 implements RBAC with the following role hierarchy:

| Role | Level | Description |
|------|-------|-------------|
| SUPER_ADMIN | 100 | Platform-wide administration |
| ORG_ADMIN | 90 | Organization administration |
| ADMIN | 80 | Administrative functions |
| MANAGER | 60 | Team management |
| INSTRUCTOR | 50 | Content delivery |
| MENTOR | 45 | Learner guidance |
| LEARNER | 40 | Standard learner access |
| MENTEE | 35 | Mentored learner |
| SUBSCRIBER | 20 | Subscription access |
| USER | 10 | Basic authenticated access |
| GUEST | 0 | Limited public access |

### 3.3 Authentication Requirements

| Control | Requirement |
|---------|-------------|
| Password Length | Minimum 8 characters |
| Password Complexity | Uppercase, lowercase, number required |
| MFA | Required for ADMIN and above roles |
| Session Timeout | 30 minutes inactivity |
| Failed Login Lockout | After 5 failed attempts |

### 3.4 Access Provisioning

**New User Access:**
1. Manager submits access request
2. Verify business need and approval
3. Assign minimum required role
4. Create account with temporary password
5. Document in access log

**Role Changes:**
1. Manager requests role change
2. Verify new job function requirements
3. Apply new role via Firebase Custom Claims
4. Log change in audit_logs collection
5. Notify user of access changes

### 3.5 Access Deprovisioning

**Termination:**
- Disable account same day as termination
- Revoke all access tokens and sessions
- Remove from all groups and roles
- Archive user data per retention policy

**Role Change:**
- Review and adjust permissions within 24 hours
- Remove no-longer-needed access
- Document changes in audit log

### 3.6 Access Reviews

| Review Type | Frequency | Scope | Reviewer |
|-------------|-----------|-------|----------|
| Privileged Access | Quarterly | ADMIN+ roles | CISO |
| All Access | Annually | All users | Managers |
| Terminated Users | Monthly | Disabled accounts | HR + IT |
| Service Accounts | Quarterly | System accounts | Engineering |

## 4. Technical Implementation

### 4.1 Firebase Custom Claims

```typescript
// Role stored in Firebase Custom Claims
{
  role: 'INSTRUCTOR',
  tenantId: 'org-123',
  permissions: ['read_courses', 'write_courses']
}
```

### 4.2 Permission Structure

LXD360 defines 27 permissions across categories:

| Category | Permissions |
|----------|-------------|
| Profile | read_own_profile, write_own_profile |
| Courses | read_courses, write_courses, publish_courses, delete_courses |
| Learners | read_learners, write_learners |
| Analytics | analytics_personal, analytics_team, analytics_org, analytics_platform |
| Users | manage_users |
| Organizations | manage_organizations |
| Platform | platform_admin |
| Content | manage_content |
| Mentorship | mentorship_access |
| Assessment | manage_assessments |

### 4.3 Audit Logging

All access control changes are logged:

| Field | Description |
|-------|-------------|
| timestamp | When the change occurred |
| userId | User whose access changed |
| changedBy | Administrator making change |
| previousRole | Role before change |
| newRole | Role after change |
| reason | Business justification |

## 5. Shared Accounts

- Shared accounts are prohibited for individual use
- Service accounts must be documented and reviewed quarterly
- Generic accounts must be disabled or justified

## 6. Remote Access

- VPN required for administrative access from untrusted networks
- MFA required for all remote access
- Session logging required for remote sessions

## 7. Third-Party Access

- Documented business need required
- Time-limited access only
- NDAs and security agreements required
- Access reviewed monthly

## 8. Enforcement

Violations may result in:
- Immediate access revocation
- Disciplinary action
- Termination
- Legal action if warranted

## 9. Exceptions

Exceptions require:
- Written justification
- Risk assessment
- CISO approval
- Time-limited duration
- Compensating controls documented

## 10. Related Policies

- POL-001: Information Security Policy
- POL-002: Acceptable Use Policy
- POL-003: Data Classification Policy

## 11. Review History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | LXD360 | Initial draft |

---

**Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | | | |
| CISO | | | |
