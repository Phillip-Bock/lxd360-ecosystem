═══════════════════════════════════════════════════════════════════════════════
                LXD360 | INSPIRE STUDIO - SYSTEM ENHANCEMENT DIRECTIVE
                     "THE GAP-FILLER PROTOCOL"
═══════════════════════════════════════════════════════════════════════════════

AGENT ID: Claude Code - Architecture Update
SCOPE: Update existing build plan with 4 Critical Missing Links
DEPENDENCIES: Assumes Phases 1-4 logic is understood/established

═══════════════════════════════════════════════════════════════════════════════
                              MISSION CONTEXT
═══════════════════════════════════════════════════════════════════════════════

We have conducted a "Red Team" audit of the INSPIRE Studio architecture and
identified 4 critical gaps required to meet "Investor-Grade" standards.

You are authorized to inject these new Phases and Updates into the existing
build pipeline immediately.

═══════════════════════════════════════════════════════════════════════════════
                    NEW PHASE 4.5: ASSET COMMAND CENTER
═══════════════════════════════════════════════════════════════════════════════

**Goal:** Centralized media repository with AI-tagging. Upload once, reuse everywhere.

**FILES TO CREATE:**
components/inspire-studio/assets/
├── AssetLibraryModal.tsx    // Main picker (Grid/List view)
├── AssetUploader.tsx        // Drag-drop zone with progress bars
├── AssetGrid.tsx            // Virtualized masonry layout
├── AssetMetadata.tsx        // Sidebar for editing Alt-Text/Tags
└── AIAutoTagger.tsx         // Hook for Vertex AI Vision integration

lib/assets/
├── storage.ts               // Firebase Storage upload logic
├── imageOptimizer.ts        // Client-side compression before upload
└── mimeTypes.ts             // Validation for allowed file types

**LOGIC REQUIREMENTS:**
1. **Storage Path:** Write files to `tenants/{id}/uploads/{year}/{month}/`.
2. **Database Record:** Create meta-doc in Firestore `tenants/{id}/assets/{assetId}`.
3. **AI Vision Hook:** On upload completion, trigger Cloud Function to send image to Vertex AI.
   - Return: `suggested_alt_text`, `tags`, `dominant_colors`.
4. **Drag-and-Drop:** Ensure assets can be dragged from this library directly onto the Course Canvas (Phase 5).

═══════════════════════════════════════════════════════════════════════════════
                    NEW PHASE 6.5: GLOBAL THEME ENGINE
═══════════════════════════════════════════════════════════════════════════════

**Goal:** "Design Tab" logic. Replaces "Slide Masters" with a CSS Variable system.

**FILES TO CREATE:**
components/inspire-studio/design/
├── ThemeEditor.tsx          // Main Design Tab container
├── ColorPaletteManager.tsx  // Primary/Secondary/Accent/Error pickers
├── TypographyManager.tsx    // Font family/size/weight scale settings
├── BlockStylePresets.tsx    // Global radius, shadow, border settings
└── ThemePreviewCard.tsx     // Live preview of changes on a dummy block

hooks/inspire/
└── useThemeSync.ts          // Listens to store and writes CSS variables to :root

**LOGIC REQUIREMENTS:**
1. **Manifest Integration:** Store config in `manifest.theme`.
2. **Instant Reactivity:** When user changes "Primary Color", update `--primary` CSS variable immediately.
3. **NASA Presets:** Pre-load the following themes:
   - "Mission Control" (Dark Mode, Cyan Accents, Mono Fonts)
   - "Corporate Clean" (Light Mode, Blue Accents, Sans Fonts)
   - "Accessibility Focus" (High Contrast, Open Dyslexic Font)

═══════════════════════════════════════════════════════════════════════════════
               UPDATE TO PHASE 7: PUBLISHING & LOCKING
═══════════════════════════════════════════════════════════════════════════════

**Goal:** Bridge Studio to Ignite LMS and prevent data overwrites.

**1. THE PUBLISHING BRIDGE**
Create `lib/inspire/publishing/publishToIgnite.ts`:
- **Validation:** Run Zod check on full manifest.
- **Flattening:** Remove editor-specific states (e.g., `isSelected`, `history`).
- **Versioning:** Auto-increment version (v1.0 -> v1.1).
- **Dual-Write:**
  - Save to `tenants/{tenantId}/courses/{courseId}` (Source of Truth).
  - Update status to `published` and set `publishedAt` timestamp.
- **Trigger:** Call Next.js `revalidatePath('/ignite/learn/catalog')` to refresh LMS.

**2. DRAFT LOCKING (CONCURRENCY SAFETY)**
Create `hooks/inspire/useDraftLock.ts`:
- **Heartbeat:** Every 30s, write to `courses/{id}/lock`:
  - `{ user: currentUser.uid, timestamp: serverTimestamp() }`
- **Check:** On load, check if lock exists & `timestamp` is < 1 min old.
- **UI:** If locked by another user, show "Read Only Mode - Editing by [User]" banner.
- **Release:** On component unmount (browser close), delete the lock document.

═══════════════════════════════════════════════════════════════════════════════
                             EXECUTION ORDER
═══════════════════════════════════════════════════════════════════════════════

1. Implement **Phase 4.5** (Assets) before starting Phase 5 (Canvas).
2. Implement **Phase 6.5** (Themes) alongside Phase 6 (Blocks).
3. Implement **Phase 7 Updates** (Publishing/Locking) as the final step of Phase 7.

Confirm you have integrated these directives into the build plan.