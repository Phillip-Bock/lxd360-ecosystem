# Data Classification Policy

**Policy ID:** POL-003
**Version:** 1.0.0
**Status:** DRAFT
**Effective Date:** TBD
**Owner:** Chief Information Security Officer

---

## 1. Purpose

This policy establishes data classification levels and handling requirements to ensure appropriate protection of LXD360 information assets.

## 2. Scope

This policy applies to:
- All data created, collected, or processed by LXD360
- All employees, contractors, and third parties handling LXD360 data
- All storage, transmission, and processing systems

## 3. Classification Levels

### 3.1 Level Definitions

| Level | Label | Description |
|-------|-------|-------------|
| **4** | RESTRICTED | Highly sensitive data requiring maximum protection |
| **3** | CONFIDENTIAL | Sensitive business data with limited access |
| **2** | INTERNAL | General business data for internal use |
| **1** | PUBLIC | Information approved for public disclosure |

### 3.2 Classification Criteria

#### RESTRICTED (Level 4)

**Examples:**
- Production database credentials
- Encryption keys
- Payment card data (PCI DSS)
- Social Security Numbers
- Protected Health Information (PHI)
- Authentication secrets
- Service account credentials

**Handling:**
- Encryption required at rest and in transit
- Access limited to named individuals
- Logging of all access required
- MFA required for access
- No storage on portable devices

#### CONFIDENTIAL (Level 3)

**Examples:**
- Customer personal data (PII)
- Learning performance data
- Employee records
- Financial reports
- Contracts and agreements
- System architecture documents
- Audit reports

**Handling:**
- Encryption required for transmission
- Access based on business need
- Access logging recommended
- Secure disposal required

#### INTERNAL (Level 2)

**Examples:**
- Internal policies and procedures
- Training materials (non-public)
- Internal communications
- Project documentation
- General business correspondence

**Handling:**
- Protected from external access
- No public posting without approval
- Standard access controls

#### PUBLIC (Level 1)

**Examples:**
- Marketing materials
- Public website content
- Published documentation
- Press releases

**Handling:**
- No special protection required
- Approved for public access
- Copyright notices as applicable

## 4. Data Handling Requirements

### 4.1 Storage Requirements

| Level | Cloud Storage | Local Storage | Portable Media |
|-------|--------------|---------------|----------------|
| RESTRICTED | Encrypted, limited access | Prohibited | Prohibited |
| CONFIDENTIAL | Encrypted | Encrypted | Encrypted, approved only |
| INTERNAL | Standard | Standard | With approval |
| PUBLIC | Standard | Standard | Allowed |

### 4.2 Transmission Requirements

| Level | Email | File Transfer | External Sharing |
|-------|-------|--------------|-----------------|
| RESTRICTED | Encrypted only | SFTP/SCP | Prohibited |
| CONFIDENTIAL | TLS required | SFTP/HTTPS | With approval and encryption |
| INTERNAL | Standard | HTTPS | With approval |
| PUBLIC | Standard | Any | Allowed |

### 4.3 Access Control Requirements

| Level | Authentication | Authorization | Monitoring |
|-------|---------------|---------------|------------|
| RESTRICTED | MFA required | Named individuals | Real-time |
| CONFIDENTIAL | Strong password | Role-based | Periodic review |
| INTERNAL | Standard | Role-based | Standard |
| PUBLIC | None | None | None |

### 4.4 Retention and Disposal

| Level | Retention | Disposal Method |
|-------|-----------|-----------------|
| RESTRICTED | Per legal requirement | Cryptographic erasure |
| CONFIDENTIAL | Per retention schedule | Secure deletion |
| INTERNAL | Per business need | Standard deletion |
| PUBLIC | Per business need | Standard deletion |

## 5. LXD360 Data Categories

### 5.1 Customer Data

| Data Type | Classification | Justification |
|-----------|---------------|---------------|
| Email addresses | CONFIDENTIAL | PII |
| Names | CONFIDENTIAL | PII |
| Learning progress | CONFIDENTIAL | Performance data |
| Assessment scores | CONFIDENTIAL | Performance data |
| xAPI statements | CONFIDENTIAL | Learning records |
| Payment information | RESTRICTED | PCI DSS |
| Health-related data | RESTRICTED | HIPAA |

### 5.2 System Data

| Data Type | Classification | Justification |
|-----------|---------------|---------------|
| API keys | RESTRICTED | Security credential |
| Database credentials | RESTRICTED | Security credential |
| Encryption keys | RESTRICTED | Security credential |
| Audit logs | CONFIDENTIAL | Security evidence |
| Application logs | INTERNAL | Operational data |
| Error logs | INTERNAL | Debugging data |

### 5.3 Business Data

| Data Type | Classification | Justification |
|-----------|---------------|---------------|
| Financial records | CONFIDENTIAL | Sensitive business |
| Customer contracts | CONFIDENTIAL | Legal documents |
| Pricing information | CONFIDENTIAL | Commercial |
| Marketing materials | PUBLIC | Public content |
| Help documentation | PUBLIC | Public content |

## 6. Labeling Requirements

### 6.1 Document Labeling

- RESTRICTED: Header/footer label required
- CONFIDENTIAL: Header/footer label required
- INTERNAL: Label recommended
- PUBLIC: No label required

### 6.2 Email Labeling

Include classification in subject line for RESTRICTED and CONFIDENTIAL:
- `[RESTRICTED] Subject Line`
- `[CONFIDENTIAL] Subject Line`

## 7. Incident Reporting

Report immediately to CISO if:
- RESTRICTED data is accessed without authorization
- CONFIDENTIAL data is transmitted without encryption
- Any data is shared with unauthorized parties
- Classification labels are removed or altered

## 8. Training Requirements

- All employees: Annual data classification training
- Data handlers: Role-specific training
- New hires: Classification training within 30 days

## 9. Enforcement

Violations may result in:
- Access revocation
- Disciplinary action
- Termination
- Legal action if warranted

## 10. Related Policies

- POL-001: Information Security Policy
- POL-004: Access Control Policy
- POL-009: Privacy Policy

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
