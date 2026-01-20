# LXD360 Content Authoring Blocks Reference

**Last Updated:** 2026-01-20
**Total Blocks:** 83 unique content blocks across 10 categories

This document provides a comprehensive reference of all content authoring blocks available in the LXD360 INSPIRE Studio lesson editor.

---

## Table of Contents

1. [Block Categories](#block-categories)
2. [Text Blocks](#text-blocks-12)
3. [Image Blocks](#image-blocks-8)
4. [Video Blocks](#video-blocks-6)
5. [Audio Blocks](#audio-blocks-4)
6. [Interactive Blocks](#interactive-blocks-15)
7. [Assessment Blocks](#assessment-blocks-12)
8. [Data Blocks](#data-blocks-6)
9. [Layout Blocks](#layout-blocks-8)
10. [Media Blocks (XR)](#media-blocks-6)
11. [Social Blocks](#social-blocks-6)
12. [Starter 10 Blocks (MVP)](#starter-10-blocks-mvp)
13. [Block Properties](#block-properties)

---

## Block Categories

| Category | Icon | Color | Count | Description |
|----------|------|-------|-------|-------------|
| Text | Type | #3b82f6 | 12 | Text-based content blocks |
| Images | Image | #22c55e | 8 | Image and visual content |
| Video | Video | #ef4444 | 6 | Video and motion content |
| Audio | Volume2 | #a855f7 | 4 | Audio and podcast content |
| Interactive | MousePointer | #f59e0b | 15 | Interactive learning elements |
| Assessment | CheckCircle | #06b6d4 | 12 | Quiz and assessment blocks |
| Data | BarChart | #84cc16 | 6 | Charts, tables, and data visualization |
| Layout | Layout | #8b5cf6 | 8 | Layout and structure blocks |
| Media | Cube | #ec4899 | 6 | 3D, AR, VR and immersive media |
| Social | Users | #14b8a6 | 6 | Social and collaborative elements |

---

## Text Blocks (12)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Paragraph** | `paragraph` | Low | Scaffold, Navigate | 95/100 |
| **Heading 1** | `heading-1` | Low | Ignite, Navigate | 100/100 |
| **Heading 2** | `heading-2` | Low | Scaffold, Navigate | 100/100 |
| **Heading 3** | `heading-3` | Low | Scaffold | 100/100 |
| **Heading 4** | `heading-4` | Low | Scaffold | 100/100 |
| **Heading 5** | `heading-5` | Low | Scaffold | 100/100 |
| **Heading 6** | `heading-6` | Low | Scaffold | 100/100 |
| **Quote** | `quote` | Low | Ignite, Reflect | 95/100 |
| **Callout** | `callout` | Low | Scaffold, Navigate | 90/100 |
| **Code** | `code` | Medium | Scaffold, Practice | 85/100 |
| **Note** | `note` | Low | Scaffold | 90/100 |
| **Tip** | `tip` | Low | Scaffold, Practice | 90/100 |

---

## Image Blocks (8)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Single Image** | `image-single` | Low | Ignite, Scaffold | 85/100 |
| **Gallery** | `image-gallery` | Medium | Scaffold, Integrate | 80/100 |
| **Carousel** | `image-carousel` | Medium | Scaffold | 75/100 |
| **Comparison** | `image-comparison` | Medium | Scaffold, Integrate | 80/100 |
| **Annotated** | `image-annotated` | Medium | Scaffold | 75/100 |
| **Hotspot** | `image-hotspot` | High | Practice, Integrate | 70/100 |
| **Before/After** | `image-before-after` | Medium | Scaffold, Integrate | 75/100 |
| **360° View** | `image-360` | High | Scaffold, Extend | 60/100 |

> **New:** 360° View block for panoramic images

---

## Video Blocks (6)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility | Premium |
|-------|-----|----------------|----------------|---------------|---------|
| **Video Embed** | `video-embed` | Medium | Ignite, Scaffold | 80/100 | No |
| **Video Upload** | `video-upload` | Medium | Scaffold | 75/100 | No |
| **Interactive Video** | `video-interactive` | High | Practice, Integrate | 70/100 | Yes |
| **Video Quiz** | `video-quiz` | High | Practice | 70/100 | No |
| **Video + Transcript** | `video-transcript` | Medium | Scaffold | 95/100 | No |
| **Branching Video** | `video-branching` | High | Practice, Extend | 65/100 | Yes |

> **New & Premium:** Branching Video for choose-your-path experiences

---

## Audio Blocks (4)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Audio Embed** | `audio-embed` | Low | Scaffold | 85/100 |
| **Audio Upload** | `audio-upload` | Low | Scaffold | 80/100 |
| **Podcast** | `audio-podcast` | Medium | Scaffold, Extend | 80/100 |
| **Audio + Transcript** | `audio-transcript` | Medium | Scaffold | 95/100 |

---

## Interactive Blocks (15)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Drag & Drop** | `drag-drop` | High | Practice | 70/100 |
| **Flip Cards** | `flip-cards` | Medium | Practice, Scaffold | 80/100 |
| **Tabs** | `tabs` | Low | Scaffold | 90/100 |
| **Accordion** | `accordion` | Low | Scaffold | 90/100 |
| **Timeline** | `timeline` | Medium | Navigate, Scaffold | 80/100 |
| **Process** | `process` | Medium | Navigate, Scaffold | 85/100 |
| **Reveal** | `reveal` | Medium | Practice, Scaffold | 80/100 |
| **Click & Learn** | `click-learn` | Medium | Practice | 75/100 |
| **Slider** | `slider` | Low | Practice | 80/100 |
| **Sorting** | `sorting` | High | Practice | 70/100 |
| **Matching** | `matching` | High | Practice | 70/100 |
| **Categorizing** | `categorizing` | High | Practice, Integrate | 70/100 |
| **Labeling** | `labeling` | High | Practice | 70/100 |
| **Sequencing** | `sequencing` | High | Practice | 70/100 |
| **Exploration** | `exploration` | High | Extend, Integrate | 65/100 |

> **New:** Exploration block for free-form discovery learning

---

## Assessment Blocks (12)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility | Premium |
|-------|-----|----------------|----------------|---------------|---------|
| **Multiple Choice** | `multiple-choice` | Medium | Practice, Reflect | 95/100 | No |
| **True/False** | `true-false` | Low | Practice | 95/100 | No |
| **Fill in Blank** | `fill-blank` | Medium | Practice | 90/100 | No |
| **Matching** | `matching-quiz` | High | Practice | 75/100 | No |
| **Ordering** | `ordering-quiz` | High | Practice | 75/100 | No |
| **Hotspot** | `hotspot-quiz` | High | Practice | 65/100 | No |
| **Essay** | `essay` | High | Reflect, Extend | 90/100 | No |
| **Short Answer** | `short-answer` | Medium | Practice, Reflect | 90/100 | No |
| **Likert Scale** | `likert-scale` | Low | Reflect | 85/100 | No |
| **Matrix** | `matrix` | High | Reflect | 70/100 | No |
| **Ranking** | `ranking` | High | Reflect, Practice | 75/100 | No |
| **Scenario** | `scenario` | High | Practice, Extend | 70/100 | Yes |

> **Premium:** Scenario block for branching decision-based assessments

---

## Data Blocks (6)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Chart** | `chart` | Medium | Scaffold, Integrate | 75/100 |
| **Table** | `table` | Medium | Scaffold | 85/100 |
| **Infographic** | `infographic` | Medium | Scaffold, Integrate | 70/100 |
| **Stats Counter** | `stats-counter` | Low | Ignite, Integrate | 85/100 |
| **Progress** | `progress` | Low | Navigate, Reflect | 90/100 |
| **Comparison** | `comparison-data` | Medium | Scaffold, Integrate | 80/100 |

---

## Layout Blocks (8)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Columns** | `columns` | Low | Scaffold | 90/100 |
| **Cards** | `cards` | Low | Scaffold | 90/100 |
| **Grid** | `grid` | Low | Scaffold | 90/100 |
| **Masonry** | `masonry` | Low | Scaffold | 80/100 |
| **Feature Box** | `feature-box` | Low | Ignite, Scaffold | 90/100 |
| **Hero** | `hero` | Low | Ignite | 85/100 |
| **Section** | `section` | Low | Scaffold | 95/100 |
| **Divider** | `divider` | Low | Scaffold | 100/100 |

---

## Media Blocks (6)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility | Premium |
|-------|-----|----------------|----------------|---------------|---------|
| **3D Model** | `3d-model` | High | Scaffold, Extend | 50/100 | Yes |
| **Animation** | `animation` | Medium | Ignite, Scaffold | 70/100 | No |
| **AR Experience** | `ar-experience` | High | Extend, Practice | 40/100 | Yes |
| **VR Scene** | `vr-scene` | High | Extend | 35/100 | Yes |
| **Simulation** | `simulation` | High | Practice, Extend | 60/100 | Yes |
| **Game** | `game` | High | Practice, Extend | 55/100 | Yes |

> **New & Premium:** AR Experience and VR Scene for immersive learning

---

## Social Blocks (6)

| Block | ID | Cognitive Load | INSPIRE Phases | Accessibility |
|-------|-----|----------------|----------------|---------------|
| **Discussion** | `discussion` | Medium | Reflect, Integrate | 90/100 |
| **Comment** | `comment` | Low | Reflect | 90/100 |
| **Reaction** | `reaction` | Low | Reflect | 85/100 |
| **Poll** | `poll` | Low | Ignite, Reflect | 90/100 |
| **Peer Review** | `peer-review` | High | Reflect, Integrate | 85/100 |
| **Collaboration** | `collaboration` | High | Integrate, Extend | 75/100 |

> **New:** Collaboration block for team-based learning activities

---

## Starter 10 Blocks (MVP)

These are the core foundational blocks available at launch:

| # | Block | Type | Category | Default Duration |
|---|-------|------|----------|------------------|
| 1 | **Paragraph** | `paragraph` | Text | 30s |
| 2 | **Image** | `image` | Media | 15s |
| 3 | **Video** | `video` | Media | 120s |
| 4 | **Quote** | `quote` | Text | 20s |
| 5 | **List** | `list` | Text | 30s |
| 6 | **Multiple Choice** | `mc-question` | Assessment | 60s |
| 7 | **Fill in the Blank** | `fitb-question` | Assessment | 90s |
| 8 | **Accordion** | `accordion` | Interactive | 45s |
| 9 | **Tabs** | `tabs` | Interactive | 45s |
| 10 | **Flip Card** | `flip-card` | Interactive | 30s |

**Source:** [lib/block-registry.ts](../lib/block-registry.ts)

---

## Block Properties

Every content block includes the following configurable properties:

### Common Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique block identifier |
| `name` | string | Display name |
| `category` | BlockCategory | Category grouping |
| `description` | string | Block purpose description |
| `icon` | string | Lucide icon name |
| `cognitiveLoad` | low \| medium \| high | Cognitive load level |
| `suggestedPhases` | InspirePhase[] | Recommended INSPIRE phases |
| `estimatedTime` | number | Time to complete (seconds) |
| `accessibilityScore` | number | WCAG compliance (0-100) |
| `isPremium` | boolean | Premium tier required |
| `isNew` | boolean | Recently added block |
| `keywords` | string[] | Search keywords |

### INSPIRE Phases

Blocks are tagged with suggested phases from the INSPIRE framework:

| Phase | Purpose | Example Blocks |
|-------|---------|----------------|
| **Ignite** | Capture attention | Hero, Quote, Poll, Stats Counter |
| **Navigate** | Provide roadmap | Heading 1, Timeline, Process, Progress |
| **Scaffold** | Build foundation | Paragraph, Image, Tabs, Table |
| **Practice** | Active learning | Drag & Drop, Multiple Choice, Simulation |
| **Integrate** | Connect concepts | Gallery, Categorizing, Discussion |
| **Reflect** | Metacognition | Essay, Peer Review, Likert Scale |
| **Extend** | Transfer learning | VR Scene, Exploration, Branching Video |

### Cognitive Load Weights

| Level | Weight | Example Blocks |
|-------|--------|----------------|
| **Low** | 1 | Paragraph, Heading, Divider |
| **Medium** | 2 | Video, Chart, Tabs |
| **High** | 3 | Drag & Drop, Scenario, VR Scene |

### xAPI Verbs (Starter 10)

| Block | xAPI Verbs |
|-------|------------|
| Paragraph | `read` |
| Image | `viewed` |
| Video | `played`, `paused`, `completed`, `seeked` |
| Quote | `read` |
| List | `read` |
| MC Question | `answered`, `attempted`, `passed`, `failed` |
| FITB Question | `answered`, `attempted`, `passed`, `failed` |
| Accordion | `interacted`, `expanded`, `collapsed` |
| Tabs | `interacted`, `selected` |
| Flip Card | `interacted`, `flipped` |

---

## Source Files

| File | Description |
|------|-------------|
| [lib/block-registry.ts](../lib/block-registry.ts) | Starter 10 block definitions |
| [lib/features/inspire-studio/config/authoringBlocks.ts](../lib/features/inspire-studio/config/authoringBlocks.ts) | Full authoring blocks (83 blocks) |
| [types/blocks.ts](../types/blocks.ts) | Block type definitions |
| [components/blocks/](../components/blocks/) | Block render components |
| [components/inspire-studio/authoring/blocks/](../components/inspire-studio/authoring/blocks/) | Block editor components |

---

## Summary

| Category | Count | Premium |
|----------|-------|---------|
| Text | 12 | 0 |
| Images | 8 | 0 |
| Video | 6 | 2 |
| Audio | 4 | 0 |
| Interactive | 15 | 0 |
| Assessment | 12 | 1 |
| Data | 6 | 0 |
| Layout | 8 | 0 |
| Media (XR) | 6 | 5 |
| Social | 6 | 0 |
| **Total** | **83** | **8** |

---

*Generated from LXD360 INSPIRE Studio codebase*
