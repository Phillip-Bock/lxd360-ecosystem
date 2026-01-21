# Disaster Recovery & Business Continuity

This directory contains LXD360's disaster recovery and business continuity documentation.

## Documents

| Document | Purpose |
|----------|---------|
| [disaster-recovery-plan.md](./disaster-recovery-plan.md) | Master DR plan with RTO/RPO targets |
| [runbooks/](./runbooks/) | Operational runbooks for incident response |
| [backup-procedures.md](./backup-procedures.md) | Data backup and restoration procedures |
| [escalation-matrix.md](./escalation-matrix.md) | Contact and escalation procedures |

## Quick Reference

### Recovery Objectives

| Tier | RTO | RPO | Services |
|------|-----|-----|----------|
| Tier 1 (Critical) | 1 hour | 15 minutes | Auth, Core API, Firestore |
| Tier 2 (High) | 4 hours | 1 hour | Learning Engine, xAPI |
| Tier 3 (Medium) | 8 hours | 4 hours | Analytics, Email |
| Tier 4 (Low) | 24 hours | 24 hours | Admin tools, Reports |

### Emergency Contacts

| Role | Contact |
|------|---------|
| On-Call Engineer | See PagerDuty |
| Engineering Lead | escalation@lxd360.com |
| Security Team | security@lxd360.com |
| Executive Sponsor | exec-oncall@lxd360.com |

### Critical Procedures

1. **Service Outage**: See [runbooks/service-outage.md](./runbooks/service-outage.md)
2. **Database Recovery**: See [runbooks/database-recovery.md](./runbooks/database-recovery.md)
3. **Security Incident**: See [runbooks/security-incident.md](./runbooks/security-incident.md)

## Review Schedule

- **Quarterly**: DR drill execution and documentation update
- **Annually**: Full business continuity plan review
- **After incidents**: Post-incident review and procedure updates

---

**Document Owner:** Engineering Team
**Last Updated:** January 2026
**Review Frequency:** Quarterly
