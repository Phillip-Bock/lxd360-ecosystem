# INSPIRE Platform — Project Context

## Overview

INSPIRE is an enterprise learning experience platform built on neuroscience-backed
instructional design principles. The platform combines adaptive AI/ML with the
proprietary INSPIRE Framework to deliver personalized learning experiences.

## Company

- **Name**: LXD360, LLC
- **Type**: Service-Disabled Veteran-Owned Small Business (SDVOSB)
- **CEO/Founder**: Phill Bock, PhD
- **Domain**: Neuroscience-backed learning experience design

## Products

### 1. INSPIRE Studio (Authoring Tool)

AI-powered course authoring with the INSPIRE Framework:

- AI-Powered Course Builder (INSPIRE Methodology)
- Standard Course Builder (ADDIE/SAM compatible)
- 70+ Content Block Types
- SCORM 1.2/2004, xAPI, cmi5 Export
- Neuro-naut AI Design Assistant

### 2. INSPIRE Ignite (LMS/LXP/LRS)

Unified learning platform:

- Adaptive Learning Engine (BKT + SM-2)
- Glass Box AI (Explainable Recommendations)
- Skill Mastery Tracking
- Compliance Dashboard
- LRS with xAPI 1.0.3

## Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 4.x |
| State | Zustand (request-scoped) |
| Database | Firestore (operational) |
| Analytics | BigQuery (xAPI LRS) |
| AI/ML | Vertex AI (Gemini 2.0) |
| Auth | Firebase Auth + Edge middleware |
| Hosting | Cloud Run (Gen2) |

### GCP Services

- **Cloud Run**: Gen2 with CPU Boost, min-instances
- **Firestore**: Multi-tenant document database
- **BigQuery**: xAPI analytics and reporting
- **Pub/Sub**: Event streaming for xAPI statements
- **Vertex AI**: Content generation and recommendations
- **Secret Manager**: All sensitive configuration
- **Cloud Trace**: Distributed tracing (OpenTelemetry)

## Key Principles

### 1. Server-First Architecture

- Maximize React Server Components
- Minimize client JavaScript bundle
- Server Actions for mutations
- API routes only for webhooks

### 2. Golden Thread

Zod schemas flow from database to UI:

```
Firestore → Zod Schema → TypeScript Type → Server Action → Form
```

### 3. Glass Box AI

All AI decisions must be explainable:

- No black-box recommendations
- Confidence scores with explanations
- User control over AI behavior

### 4. Zero Tolerance

- No `any` types
- No `@ts-ignore`
- No lint exceptions
- No console.log in production

## Target Markets

- Healthcare (HIPAA compliance)
- Defense (FedRAMP pathway)
- Financial Services (SOC 2)
- Enterprise L&D

## User Personas

| Persona | Description | Access |
|---------|-------------|--------|
| Owner | Tenant owner/designer | Full access + Billing |
| Editor | Course builder | Authoring only |
| Manager | Client administrator | LMS dashboards |
| Learner | Content consumer | Learn section only |
