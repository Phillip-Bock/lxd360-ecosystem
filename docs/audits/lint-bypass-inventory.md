# Lint Bypass Inventory

**Generated:** January 25, 2026
**Branch:** claude/gcb-cleanup-phase4
**Auditor:** Claude Code

## Summary

| Type | Before | After | Fixed |
|------|--------|-------|-------|
| biome-ignore | 55 | 55 | 0 (all justified) |
| @ts-ignore | 0 | 0 | N/A |
| @ts-expect-error | 0 | 0 | N/A |
| Explicit `any` (z.any()) | 1 | 0 | 1 |

**Total Bypass Comments:** 56 before, 55 after (1 fixed)
**Status:** All remaining bypasses have proper justification comments.

## Fixes Applied

### 1. `z.any()` Converted to `z.unknown()`

**File:** `apps/web/components/inspire-studio/branching/types.ts:170`

**Before:**
```typescript
data: z.any(), // ReactFlow requires any for data
```

**After:**
```typescript
// ReactFlow node data - we use unknown with runtime validation rather than any
// The actual data should conform to one of the specific node data schemas above
data: z.unknown(),
```

**Rationale:** Using `z.unknown()` instead of `z.any()` provides better type safety. The unknown type forces consumers to perform proper type narrowing before accessing properties, which is the recommended pattern for Zod schemas when the exact shape varies.

## Remaining Bypasses (All Justified)

### Category A: ContentEditable Rich Text Pattern (30 instances)

These bypasses are necessary because contentEditable divs cannot use native `<textarea>` elements for rich text editing. The `role="textbox"` pattern is the accessible approach.

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `components/blocks/text/quote-block.tsx` | 94 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/blocks/text/paragraph-block.tsx` | 107 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/statements/StatementBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/statements/InvertedStatementBlock.tsx` | 15 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/statements/DashedStatementBlock.tsx` | 15 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/callouts/ExpertInsightBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/special/TestimonialBlock.tsx` | 22, 34 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/special/StatisticsDisplay.tsx` | 95 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/callouts/CustomCalloutBlock.tsx` | 46, 59 | `lint/a11y/useSemanticElements` | contentEditable requires span/div with role="textbox" |
| `components/content-blocks/special/ReferencesBlock.tsx` | 39 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/blockquotes/QuoteLeftAligned.tsx` | 11, 23 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/lists/DefinitionList.tsx` | 80, 92 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/blockquotes/QuoteCentered.tsx` | 13, 25 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/WarningBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/SuccessBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/NoteBlock.tsx` | 15 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/CautionBlock.tsx` | 15 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/AlertBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/content-blocks/alerts/DangerBlock.tsx` | 17 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/summary-box.tsx` | 27 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/reflection-prompts.tsx` | 46 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/prerequisites.tsx` | 40 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/learning-objectives.tsx` | 41 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/key-takeaways.tsx` | 41 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-ignite/progress/badge-achievement-display.tsx` | 37 | `lint/a11y/useSemanticElements` | contentEditable requires span with role="textbox" |
| `components/inspire-ignite/progress/activity-instructions.tsx` | 56 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |
| `components/inspire-studio/blocks/text/TextBlock.tsx` | 191 | `lint/a11y/useSemanticElements` | contentEditable requires div with role="textbox" |

### Category B: Intentional useEffect Dependency Control (5 instances)

These bypasses exist because the useEffect hooks are intentionally designed to trigger only on specific state changes (e.g., message count for scroll behavior, cleanup on unmount only).

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `providers/player-provider.tsx` | 235 | `lint/correctness/useExhaustiveDependencies` | Cleanup effect intentionally runs only on unmount |
| `components/admin/CharacterManager.tsx` | 55 | `lint/correctness/useExhaustiveDependencies` | Intentional - only load on user change |
| `components/ai-character/AiCharacterChat.tsx` | 78 | `lint/correctness/useExhaustiveDependencies` | Intentional trigger on message count change |
| `components/inspire-studio/mission-control/CoPilotSidebar.tsx` | 117 | `lint/correctness/useExhaustiveDependencies` | Intentional - scroll on message count change |
| `components/ignite/player/IgniteCoach.tsx` | 170 | `lint/correctness/useExhaustiveDependencies` | Intentionally track messages array changes for scrolling |

### Category C: Framer Motion Image Animation (3 instances)

Framer Motion's `motion.img` component requires native `<img>` elements for layout animations. Next.js `Image` component is not compatible with motion layout animations.

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `components/motion-primitives/morphing-dialog.tsx` | 339 | `lint/performance/noImgElement` | motion.img required for framer-motion layout animations |
| `components/motion-primitives/image-comparison.tsx` | 110 | `lint/performance/noImgElement` | motion.img required for framer-motion animations |
| `components/blocks/immersive/panorama-viewer.tsx` | 413 | `lint/performance/noImgElement` | Small decorative map preview |

### Category D: Third-Party Library Type Declarations (1 instance)

Type declaration files for third-party libraries require flexible typing to avoid conflicts with the actual library implementations.

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `types/react-three.d.ts` | 1 | `biome-ignore-all lint/suspicious/noExplicitAny` | Type declarations for @react-three libraries require flexible typing |

### Category E: Complex UI Patterns (13 instances)

These bypasses exist for complex UI components where semantic HTML alternatives don't apply or would break functionality.

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `components/ui/carousel.tsx` | 117 | `lint/a11y/useSemanticElements` | role="region" needed for aria-roledescription |
| `components/ui/form-feedback.tsx` | 274 | `lint/a11y/useSemanticElements` | Custom visual meter with 4 segments cannot use native `<meter>` |
| `components/inspire-studio/encoding/Step1_1_Research/CSVUploader.tsx` | 217 | `lint/a11y/useSemanticElements` | File upload zone with drag-drop requires div |
| `components/inspire-studio/encoding/Step1_1_Research/AIResearchInjector.tsx` | 184 | `lint/a11y/useSemanticElements` | Custom checkbox card with nested checkbox input |
| `components/inspire-studio/spatial/ThreeSixtyEditor/HotspotMarker.tsx` | 128 | `lint/a11y/useSemanticElements` | Hotspot list item with complex layout requires div |
| `components/inspire-studio/design/ThemePreviewCard.tsx` | 53 | `lint/a11y/useSemanticElements` | Theme card with complex styling requires div container |
| `components/inspire-studio/branching/VariableManager/VariableEditor.tsx` | 85 | `lint/a11y/useSemanticElements` | Expandable header with nested button requires div |
| `components/ui/pagination.tsx` | 46 | `lint/a11y/useSemanticElements` | role="link" needed for aria-label support when href may be absent |
| `components/inspire-studio/scenario-editor/Connection.tsx` | 66, 120 | `lint/a11y/useSemanticElements` | SVG `<g>` element cannot be replaced with `<button>` |
| `app/(tenant)/cognitive/components/hud/modality-swapper.tsx` | 74 | `lint/a11y/useSemanticElements` | Custom styled radio button within radiogroup |
| `app/(tenant)/cognitive/components/hud/cognitive-load-ring.tsx` | 65 | `lint/a11y/useSemanticElements` | Custom meter with SVG animations requires div container |
| `components/inspire-studio/assimilation/CourseCanvas/BlockItem.tsx` | 87 | `lint/a11y/useSemanticElements` | Canvas block uses absolute positioning incompatible with native button |

### Category F: Intentional Event Handler Pattern (1 instance)

| File | Line | Rule | Justification |
|------|------|------|---------------|
| `components/inspire-studio/blocks/media/VideoBlock.tsx` | 218 | `lint/a11y/noStaticElementInteractions` | Mouse handlers are for hover-based UX enhancement only |

## Recommendations

1. **ContentEditable Pattern:** Consider creating a shared `<RichTextEditor>` component that encapsulates the contentEditable accessibility pattern to reduce repetition.

2. **Type Declaration Maintenance:** Keep `types/react-three.d.ts` updated as React Three Fiber stabilizes its types for React 19.

3. **useEffect Dependencies:** Document the intentional dependency patterns in the codebase guidelines for future contributors.

## Validation

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm typecheck` | 0 errors | All packages pass |
| `pnpm lint` | 0 errors | Biome check passes |
| `pnpm build` (compilation) | Success | Next.js compilation succeeds |
| `pnpm build` (standalone) | Windows symlink issue | Pre-existing infrastructure issue (EPERM symlink on Windows) |

**Note:** The standalone output build phase fails on Windows due to symlink permission requirements.
This is a pre-existing infrastructure issue unrelated to code changes. The compilation itself succeeds.

---

*Document generated as part of GCB cleanup Phase 4*
