# Escalation Matrix

**Document ID:** DR-003
**Version:** 1.0.0
**Status:** DRAFT
**Owner:** Engineering Team

---

## 1. Overview

This document defines the escalation procedures for incidents affecting the LXD360 platform.

## 2. Severity Definitions

| Severity | Definition | Examples |
|----------|------------|----------|
| **SEV1** | Complete service outage affecting all users | Platform unreachable, authentication down, database unavailable |
| **SEV2** | Major feature unavailable or severe degradation | Learning engine down, payments failing, data corruption |
| **SEV3** | Partial degradation affecting subset of users | Slow performance, intermittent errors, single region issue |
| **SEV4** | Minor issue with workaround available | UI glitch, non-critical feature broken, cosmetic issue |

## 3. Escalation Contacts

### 3.1 Engineering On-Call

| Role | Primary Contact | Backup Contact | Escalation Path |
|------|-----------------|----------------|-----------------|
| On-Call Engineer | PagerDuty rotation | Secondary on-call | Engineering Lead |
| Engineering Lead | engineering-lead@lxd360.com | CTO | CTO |
| Security Engineer | security@lxd360.com | Engineering Lead | CTO |

### 3.2 Leadership

| Role | Contact | When to Engage |
|------|---------|----------------|
| CTO | cto@lxd360.com | SEV1, SEV2 > 1 hour |
| CEO | ceo@lxd360.com | SEV1 > 2 hours, PR issues |
| Legal | legal@lxd360.com | Data breach, compliance issues |

### 3.3 External Contacts

| Vendor | Support Contact | SLA |
|--------|-----------------|-----|
| GCP Support | Cloud Console | < 1 hour (Premium) |
| Firebase Support | Firebase Console | < 4 hours |
| Stripe Support | support@stripe.com | < 1 hour |
| Brevo Support | support@brevo.com | < 4 hours |

## 4. Escalation Timelines

### 4.1 SEV1 - Critical

| Time | Action | Contact |
|------|--------|---------|
| 0 min | Alert triggered | On-Call Engineer |
| 5 min | Incident acknowledged | On-Call Engineer |
| 15 min | Initial assessment | On-Call Engineer |
| 15 min | Escalate to Engineering Lead | Engineering Lead |
| 30 min | Status page updated | Communications |
| 30 min | Notify CTO | CTO |
| 1 hour | Customer communication | Support Team |
| 2 hours | Notify CEO if unresolved | CEO |

### 4.2 SEV2 - High

| Time | Action | Contact |
|------|--------|---------|
| 0 min | Alert triggered | On-Call Engineer |
| 15 min | Incident acknowledged | On-Call Engineer |
| 30 min | Initial assessment | On-Call Engineer |
| 1 hour | Escalate to Engineering Lead | Engineering Lead |
| 1 hour | Status page updated | Communications |
| 2 hours | Notify CTO if unresolved | CTO |

### 4.3 SEV3 - Medium

| Time | Action | Contact |
|------|--------|---------|
| 0 min | Alert triggered | On-Call Engineer |
| 1 hour | Incident acknowledged | On-Call Engineer |
| 2 hours | Engineering Lead notified | Engineering Lead |
| 4 hours | Resolution or escalation | Engineering Lead |

### 4.4 SEV4 - Low

| Time | Action | Contact |
|------|--------|---------|
| 0 min | Issue reported | On-Call Engineer |
| 4 hours | Triage and prioritize | On-Call Engineer |
| 24 hours | Assignment to sprint | Engineering Lead |

## 5. Communication Channels

### 5.1 Internal

| Channel | Purpose | Audience |
|---------|---------|----------|
| #incidents (Slack) | Real-time incident coordination | Engineering |
| #incidents-updates | Status updates | All staff |
| Email: incidents@lxd360.com | Formal documentation | Leadership |
| PagerDuty | Alerting and escalation | On-call team |

### 5.2 External

| Channel | Purpose | When to Use |
|---------|---------|-------------|
| Status page | Public status updates | SEV1, SEV2 |
| In-app banner | User notification | Active incidents |
| Email to customers | Detailed communication | Major incidents |
| Social media | Public communication | Extended outages |

## 6. Escalation Procedures

### 6.1 How to Escalate

1. **Document the issue:**
   - Current status
   - Actions taken
   - Why escalation is needed

2. **Contact the next level:**
   - Use primary contact method
   - If no response in 10 minutes, use backup

3. **Provide context:**
   - Incident timeline
   - Impact assessment
   - Resources needed

4. **Handoff:**
   - Brief the escalation contact
   - Remain available for questions
   - Continue working unless directed otherwise

### 6.2 When to Escalate

**Escalate immediately if:**
- Impact is greater than initially assessed
- Resolution is taking longer than expected
- Additional expertise is needed
- Customer or PR impact is likely
- Security or compliance concerns arise

**Do not hesitate to escalate.** It's better to escalate early and not need it than to delay and make the situation worse.

## 7. Incident Roles

### 7.1 Incident Commander (IC)

**Responsibilities:**
- Own the incident from detection to resolution
- Coordinate all response activities
- Make decisions on response strategy
- Communicate status to stakeholders
- Declare incident resolved

**Who:** Engineering Lead or designated senior engineer

### 7.2 Technical Lead

**Responsibilities:**
- Lead technical investigation
- Direct engineering team
- Implement fixes
- Document technical timeline

**Who:** Most senior engineer for affected system

### 7.3 Communications Lead

**Responsibilities:**
- Write status updates
- Update status page
- Draft customer communications
- Coordinate with support team

**Who:** Product Manager or designated team member

### 7.4 Scribe

**Responsibilities:**
- Document all actions and decisions
- Maintain incident timeline
- Track action items
- Prepare post-incident review materials

**Who:** Available engineer not directly involved in fix

## 8. Vendor Escalation

### 8.1 GCP/Firebase Issues

1. Check GCP Status Dashboard: https://status.cloud.google.com/
2. Check Firebase Status: https://status.firebase.google.com/
3. Open support case via Cloud Console
4. Escalate to Technical Account Manager if available

### 8.2 Stripe Issues

1. Check Stripe Status: https://status.stripe.com/
2. Contact support@stripe.com
3. For urgent issues: Use emergency support line (Premium accounts)

### 8.3 Brevo Issues

1. Check Brevo Status: https://status.brevo.com/
2. Contact support through dashboard
3. Escalate to account manager for enterprise accounts

## 9. Post-Incident

### 9.1 Immediate Actions

- [ ] Verify service fully restored
- [ ] Update status page to resolved
- [ ] Notify stakeholders
- [ ] Document resolution

### 9.2 Follow-up Actions

- [ ] Schedule PIR within 48 hours
- [ ] Draft incident report
- [ ] Identify action items
- [ ] Assign owners and deadlines

## 10. Quick Reference Card

### Severity Quick Guide

| If you see... | It's probably... |
|---------------|------------------|
| All users can't log in | SEV1 |
| Payments are failing | SEV1 |
| Database is down | SEV1 |
| Major feature broken | SEV2 |
| Some users affected | SEV3 |
| Minor UI issue | SEV4 |

### Escalation Quick Guide

| Situation | Action |
|-----------|--------|
| Need help | Ask in #incidents |
| Not sure of severity | Assume higher severity |
| No response from contact | Use backup contact |
| Situation worsening | Escalate immediately |
| Outside your expertise | Escalate immediately |

---

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-20 | LXD360 | Initial draft |
