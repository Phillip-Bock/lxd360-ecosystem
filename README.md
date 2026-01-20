<div align="center">

<img src="https://github.com/user-attachments/assets/cc214511-a664-4afd-9915-16a8d6542844" alt="LXP360 Logo" width="200"/>

# LXP360 SaaS Platform

### Enterprise Learning Experience Platform with Neuroscience-Backed Methodology

[![Deployed on GCP](https://img.shields.io/badge/Deployed%20on-Google%20Cloud-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![npm](https://img.shields.io/badge/npm-10.x-red?style=flat-square&logo=npm)](https://www.npmjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![SDVOSB](https://img.shields.io/badge/SDVOSB-Certified-blue?style=flat-square)](https://lxd360.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](./LICENSE)

**Transform corporate training with AI-powered content creation, cognitive load optimization, and measurable learning outcomes.**

---

### 🇺🇸 Service-Disabled Veteran-Owned Small Business (SDVOSB)

LXD360 LLC is a certified **Service-Disabled Veteran-Owned Small Business**, committed to delivering excellence in learning technology.

</div>

---

## 🎯 Value Proposition

LXP360 is an enterprise-grade **Learning Experience Platform (LXP)** SaaS that engineers the future of corporate learning. Built on the proprietary **INSPIRE** framework, the platform delivers:

- **🧠 Neuroscience-Based Design** — Optimize cognitive load for better retention and skill transfer
- **🤖 AI-Powered Authoring** — Generate assessments, scenarios, and learning paths automatically
- **📊 Measurable ROI** — xAPI-compliant analytics with real-time performance tracking
- **🎮 Immersive Experiences** — 3D environments, branching scenarios, and gamification
- **♿ Accessibility First** — WCAG 2.2 AA compliant with built-in validation tools

---

## 🌟 The INSPIRE Framework

Our proprietary methodology powers every learning experience:

| Letter | Principle | Description |
|:------:|-----------|-------------|
| **I** | **Immersive** | 360° environments, VR/AR, and interactive simulations |
| **N** | **Neuroscience-based** | Memory science, spaced repetition, cognitive load optimization |
| **S** | **Skill-focused** | Competency mapping and measurable outcomes |
| **P** | **Personalized** | Adaptive learning paths and AI recommendations |
| **I** | **Interactive** | Hands-on exercises, scenarios, and gamification |
| **R** | **Results-driven** | Analytics, xAPI tracking, and ROI measurement |
| **E** | **Engaging** | Story-driven content with modern UX design |

---

## 📦 Product Tiers

| Tier | Product | Seats | Features |
|------|---------|-------|----------|
| **Starter** | INSPIRE Studio | 1 Author | Authoring tools only |
| **Professional** | INSPIRE Studio + LXP360 | 1-5 Authors, <50 Learners | Authoring + LMS/LRS + White Labeling |
| **Enterprise** | LXD Ecosystem | 6+ Authors, 50+ Learners | Full Suite + API + SSO + Self-Hosting Option |

---

## 🗂️ Project Structure

```
LXP360-SaaS/
├── app/                          # Next.js 15 App Router
│   ├── (public)/                 # Marketing pages
│   ├── (internal)/               # LXD360 staff dashboards
│   │   ├── super-admin/
│   │   ├── sales/
│   │   ├── program-admin/
│   │   └── support/
│   ├── (tenant)/                 # Client organization dashboards
│   │   ├── organization-owner/
│   │   └── organization-admin/
│   ├── inspire-studio/           # INSPIRE Studio (Authoring)
│   │   ├── content-director/
│   │   ├── reviewer/
│   │   ├── author/
│   │   ├── storyboard/inspire/   # INSPIRE Wizard
│   │   ├── course-builder/
│   │   ├── lesson/
│   │   ├── media-tools/
│   │   └── ...
│   ├── lxp360/                   # LXP360 (LMS/LRS)
│   │   ├── lms-admin/
│   │   ├── instructor/
│   │   ├── manager/
│   │   └── learner/
│   └── api/                      # API routes
├── packages/                     # INSPIRE monorepo packages
│   ├── inspire-core/             # Cognitive load algorithms
│   ├── inspire-player/           # Learning content player
│   ├── firestore-lrs/            # xAPI Learning Record Store
│   ├── content-blocks/           # 80+ content components
│   ├── scenario-builder/         # Branching scenario engine
│   ├── 3d-viewer/                # 3D model viewer
│   ├── accessibility-checker/    # WCAG 2.2 validation
│   ├── learner-memory/           # Spaced repetition system
│   ├── ai-quiz-generator/        # AI assessment generation
│   └── cognitive-dashboard/      # Real-time monitoring
├── components/                   # Shared React components
├── lib/                          # Utilities & clients
└── public/                       # Static assets
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 + React 19 | Full-stack React framework |
| **Language** | TypeScript 5.9 | Type-safe development |
| **Database** | Cloud Firestore | NoSQL document database |
| **Authentication** | Firebase Auth | SSO, OAuth, Magic Links |
| **Storage** | Cloud Storage | Media and file storage |
| **Hosting** | Cloud Run | Container-based deployment |
| **Email** | Brevo | Transactional and marketing emails |
| **AI/ML** | Vertex AI | Machine learning services |
| **Monitoring** | Cloud Monitoring | Observability and alerting |
| **Secrets** | Secret Manager | Secure configuration |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui + Radix UI | Accessible component primitives |
| **3D Graphics** | Three.js + React Three Fiber | Immersive learning environments |
| **State Management** | Zustand | Lightweight reactive stores |
| **Validation** | Zod | Runtime type validation |
| **Payments** | Stripe | Subscription billing |
| **Background Jobs** | Inngest | Event-driven serverless functions |

---

## 👥 Role-Based Access Control (RBAC)

### System Level (Internal LXD360 Staff)

| Role | Access |
|------|--------|
| **Super Admin** | Full platform access, all tenants, billing, server config |
| **Support Agent** | Read-only tenant access, user impersonation for troubleshooting |

### Tenant Level (Client Organizations)

| Role | Access |
|------|--------|
| **Organization Owner** | Contract holder, billing, SSO, subscription management |
| **Organization Admin** | User management, integrations, seat assignments |

### INSPIRE Studio (Authoring)

| Role | Access |
|------|--------|
| **Content Director** | Global templates, asset libraries, branding, project oversight |
| **Author** | Create/edit courses, upload assets, publish content |
| **Reviewer** | Read-only access for QA and feedback |

### LXP360 (LMS/LRS)

| Role | Access |
|------|--------|
| **LMS Admin** | Learning environment, catalogs, gamification, reporting |
| **Instructor** | Course facilitation, grading, learner support |
| **Manager** | Team progress/compliance reports for direct reports |
| **Learner** | Content consumption, assessments, progress tracking |

---

## 📦 Package Ecosystem

| Package | Purpose | Status |
|---------|---------|:------:|
| `@lxp360/inspire-core` | Cognitive load algorithm & shared types | ✅ |
| `@lxp360/inspire-player` | Learning content player | ✅ |
| `@lxp360/firestore-lrs` | xAPI Learning Record Store | ✅ |
| `@lxp360/content-blocks` | 80+ content block components | ✅ |
| `@lxp360/scenario-builder` | Branching scenario engine | ✅ |
| `@lxp360/3d-viewer` | 3D model viewer with hotspots | ✅ |
| `@lxp360/accessibility-checker` | WCAG 2.2 validation | ✅ |
| `@lxp360/learner-memory` | Spaced repetition system | ✅ |
| `@lxp360/ai-quiz-generator` | AI-powered assessment generation | ✅ |
| `@lxp360/cognitive-dashboard` | Real-time cognitive monitoring | ✅ |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | 20.x+ |
| **npm** | 10.x |
| **Git** | Latest |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Phillip-Bock/LXP360-SaaS.git
cd LXP360-SaaS

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build Next.js app |
| `npm run lint` | Run Biome linter |
| `npm run typecheck` | TypeScript type checking |

---

## ⚙️ Environment Variables

Create a `.env.local` file with the following:

```bash
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# GCP (Server-side)
GOOGLE_CLOUD_PROJECT=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

> **📖 See Also:**
> - [CLAUDE.md](./CLAUDE.md) - Complete development standards and GCP configuration

---

## 🚢 Deployment

### Production

The application is deployed on Google Cloud Run:

- **Production URL**: `https://lxp360.com`
- **CI/CD**: GitHub Actions + Cloud Build
- **Infrastructure**: 100% Google Cloud Platform

### Deploy Command

```bash
# Deploy to Cloud Run
gcloud run deploy lxd360-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --project lxd-saas-dev
```

> **📖 Full Guide:** See [CLAUDE.md](./CLAUDE.md) for complete GCP configuration

---

## 📚 Documentation

Comprehensive documentation is available in the [wiki](./wiki/) directory with **50+ pages** across 14 sections:

| Section | Description |
|---------|-------------|
| [Getting Started](./wiki/01-Getting-Started/) | Quick start, prerequisites, environment setup |
| [Architecture](./wiki/02-Architecture/) | System design, data flow, folder structure |
| [Development](./wiki/03-Development/) | Code standards, testing, debugging |
| [Deployment](./wiki/04-Deployment/) | Cloud Run, CI/CD, environments |
| [Database](./wiki/05-Database/) | Firestore, security rules, data modeling |
| [Authentication](./wiki/07-Authentication/) | Firebase Auth, SSO, RBAC |
| [Features](./wiki/08-Features/) | Course authoring, player, assessments, analytics |
| [Integrations](./wiki/09-Integrations/) | Stripe, Brevo, xAPI, Inngest |
| [Operations](./wiki/10-Operations/) | Maintenance, incidents, security |
| [Branding](./wiki/11-Branding/) | Design system, colors, typography |
| [INSPIRE Framework](./wiki/12-INSPIRE-Framework/) | ILA tools, cognitive load, methodology |
| [Troubleshooting](./wiki/13-Troubleshooting/) | Common issues, debugging, FAQ |
| [Contributing](./wiki/14-Contributing/) | How to contribute, templates |

**Additional Resources:**

- [CLAUDE.md](./CLAUDE.md) - Development standards and GCP configuration
- [Policies](./docs/policies/) - Privacy, security, accessibility, terms of use
- [Legal Documents](./docs/legal/) - DPA, HIPAA BAA, VPAT, capability statement

---

## 📄 License

**Copyright © 2025 LXD360 LLC. All Rights Reserved.**

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.

See [LICENSE](./LICENSE) for complete terms.

---

## 📞 Contact

| Department | Email |
|------------|-------|
| **Sales** | sales@lxd360.com |
| **Customer Support** | customer_support@lxd360.com |
| **IT Help** | IT_help@lxd360.com |
| **Policies & Legal** | policies@lxd360.com |
| **Administration** | admin@lxd360.com |

---

<div align="center">

**LXD360 LLC** — Daphne, Alabama

*Service-Disabled Veteran-Owned Small Business (SDVOSB)*

[Website](https://lxd360.com) • [Documentation](./wiki/01-Getting-Started/Quick-Start.md)

**Built with ❤️ by Dr. Phillip Bock & the LXD360 Team**

</div>
