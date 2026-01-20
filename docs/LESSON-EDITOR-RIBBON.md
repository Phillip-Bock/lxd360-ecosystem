# Lesson Editor Ribbon - Complete Tool Reference

**Version:** 1.0
**Last Updated:** 2026-01-20
**Total Tools:** 150+ buttons and controls across 7 tabs + 4 contextual tabs

---

## Overview

The Lesson Editor Ribbon provides an Office-style interface for content authoring, following the Microsoft Fluent Design pattern. Tools are organized into logical tabs and groups for efficient workflow.

### Ribbon Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Home │ Insert │ Design │ Interactions │ CLT │ AI Studio │ Review  │
├─────────────────────────────────────────────────────────────────────┤
│  [Tab-specific groups and tools displayed here]                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Contextual Tabs (Appear when relevant content is selected)
- **Image Tools** - Appears when an image is selected
- **Video Tools** - Appears when a video is selected
- **Audio Tools** - Appears when audio is selected
- **Quiz Tools** - Appears when a quiz/assessment is selected

---

## Tab 1: Home

The Home tab contains essential editing operations, lesson metadata, and publishing controls.

### Clipboard Group

| Tool | Icon | Action | Keyboard Shortcut |
|------|------|--------|-------------------|
| Paste | `ClipboardPaste` | Paste from clipboard | Ctrl+V |
| Cut | `Scissors` | Cut selection | Ctrl+X |
| Copy | `Copy` | Copy selection | Ctrl+C |

### History Group

| Tool | Icon | Action | Keyboard Shortcut |
|------|------|--------|-------------------|
| Undo | `Undo2` | Undo last action | Ctrl+Z |
| Redo | `Redo2` | Redo undone action | Ctrl+Y |

### Lesson Info Group

| Control | Type | Purpose |
|---------|------|---------|
| Title Input | Text Field | Edit lesson title |
| Duration Dropdown | Select | Set estimated duration (5-90 min) |

**Duration Options:**
- 5 min, 10 min, 15 min, 20 min, 30 min, 45 min, 60 min, 90 min

### Save & Publish Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Save | `Save` | Large | Save current progress |
| Preview | `Eye` | Small | Preview lesson |
| Export | `Download` | Small | Export lesson package |
| Publish | `Upload` | Small | Publish to LMS |

---

## Tab 2: Insert

The Insert tab provides access to all content block types for building lessons.

### Text Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Paragraph | `Type` | text | Rich text paragraph |
| Heading | `Heading` | heading | Section headings (H1-H6) |
| List | `List` | list | Bulleted/numbered lists |
| Quote | `Quote` | quote | Block quotations |
| Code | `Code` | code | Syntax-highlighted code |

### Media Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Image | `ImageIcon` | image | Insert images |
| Video | `Video` | video | Embed videos |
| Audio | `Music` | audio | Audio clips |
| Embed | `Globe` | embed | External embeds (YouTube, etc.) |
| File | `FileDown` | file | Downloadable files |

### Interactive Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Accordion | `PanelTopClose` | accordion | Collapsible sections |
| Tabs | `Layers` | tabs | Tabbed content panels |
| Flip Card | `FlipVertical` | flip-card | Two-sided flip cards |
| Hotspot | `MousePointerClick` | hotspot | Interactive image hotspots |
| Drag & Drop | `Move` | drag-drop | Drag and drop activities |
| Click Reveal | `Eye` | click-reveal | Click to reveal content |

### Assessment Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Quiz | `CircleHelp` | quiz | Multiple choice questions |
| Multi-Select | `ListChecks` | multi-select | Multiple answer selection |
| True/False | `ToggleLeft` | true-false | Binary choice questions |
| Fill Blank | `TextCursorInput` | fill-blank | Fill in the blank |
| Matching | `Link2` | matching | Match items activity |
| Ordering | `ArrowUpDown` | ordering | Sequence ordering |
| Short Answer | `MessageSquare` | short-answer | Open text response |

### Data Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Table | `Table` | table | Data tables |
| Chart | `BarChart3` | chart | Charts and graphs |
| Diagram | `Network` | diagram | Visual diagrams |
| Timeline | `Clock` | timeline | Chronological timelines |
| Process Flow | `GitBranch` | process-flow | Process flow diagrams |

### Knowledge Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Reflect | `Lightbulb` | reflect | Reflection prompts |
| Quick Poll | `Vote` | poll | Quick polling |
| Scenario Branch | `Split` | scenario-branch | Branching scenarios |
| Knowledge Gate | `Lock` | knowledge-gate | Conditional progression |

### Gamification Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Points | `Award` | points | Award points |
| Badge Trigger | `Medal` | badge-trigger | Trigger badge awards |
| Leaderboard | `Trophy` | leaderboard | Display leaderboards |
| Progress Milestone | `Target` | progress-milestone | Track milestones |

### Layout Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| Columns | `LayoutGrid` | columns | Multi-column layout |
| Divider | `Minus` | divider | Section dividers |
| Spacer | `Space` | spacer | Vertical spacing |
| Card | `Square` | card | Content cards |
| Callout | `AlertCircle` | callout | Highlighted callouts |

### Advanced Group

| Tool | Icon | Block Type | Description |
|------|------|------------|-------------|
| 3D Model | `Box` | 3d-model | Interactive 3D models |
| VR/AR Scene | `Headphones` | vr-ar | Virtual/Augmented reality |
| Simulation | `Cpu` | simulation | Interactive simulations |
| Branching Scenario | `Route` | branching-scenario | Complex branching |
| Custom HTML | `Code` | custom-html | Raw HTML content |

---

## Tab 3: Design

The Design tab controls visual theming and styling of the lesson.

### Theme Group

| Control | Type | Description |
|---------|------|-------------|
| Theme Gallery | Gallery Picker | Select from preset themes |
| Light Mode | Toggle | Light theme |
| Dark Mode | Toggle | Dark theme |

**Available Themes:**
- Default
- Corporate
- Modern
- Playful
- Minimal

### Colors Group

| Control | Icon | Purpose |
|---------|------|---------|
| Primary Color | `Palette` | Main brand color |
| Accent Color | `Droplets` | Secondary accent |
| Background Color | `PanelTop` | Page background |
| Text Color | `Type` | Default text color |

### Typography Group

| Control | Type | Options |
|---------|------|---------|
| Font Family | Combobox | Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Source Sans Pro |
| Font Size | Dropdown | Small, Normal, Large, Extra Large |
| Line Height | Dropdown | Tight, Normal, Relaxed, Loose |

### Layout Group

| Control | Type | Options |
|---------|------|---------|
| Layout Type | Toggle Group | Single Column, Two Columns, Left Sidebar, Right Sidebar |
| Content Width | Dropdown | Narrow (600px), Normal (800px), Wide (1000px), Full Width |

### Background Group

| Tool | Icon | Action |
|------|------|--------|
| Image | `ImageIcon` | Set background image |
| Pattern | `LayoutGrid` | Set background pattern |
| Clear | `Brush` | Clear background |

### Animations Group

| Control | Type | Purpose |
|---------|------|---------|
| Effects Toggle | Button | Enable/disable animations |
| Transition Speed | Dropdown | None, Slow, Normal, Fast |

### Branding Group

| Tool | Icon | Action |
|------|------|--------|
| Apply Brand | `SwatchBook` | Apply organization branding |
| Reset | `Wand2` | Reset to defaults |

---

## Tab 4: Interactions

The Interactions tab manages interactive elements, branching logic, and gamification.

### Knowledge Checks Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Quiz | `CircleHelp` | Large | Add quiz question |
| Poll | `Vote` | Small | Add quick poll |
| Reflection | `Lightbulb` | Small | Add reflection prompt |
| Survey | `ListChecks` | Small | Add survey |
| Configure | `Settings2` | Small | Configure settings |

### Hotspots Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Hotspot | `MousePointerClick` | Large | Add image hotspot |
| Click Reveal | `Eye` | Small | Click to reveal |
| Tooltip | `MessageSquare` | Small | Add tooltip |
| Lightbox | `Zap` | Small | Lightbox popup |

### Interactive Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Accordion | `PanelTopClose` | Large | Add accordion |
| Tabs | `Layers` | Small | Add tabs |
| Flip Card | `FlipVertical` | Small | Add flip card |
| Drag & Drop | `Move` | Small | Drag and drop |
| Sorting | `ArrowUpDown` | Small | Sorting activity |

### Branching Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Branch | `GitBranch` | Large | Add branching path |
| Condition | `Split` | Small | Add condition |
| Knowledge Gate | `Lock` | Small | Add knowledge gate |
| Jump To | `Route` | Small | Jump to section |
| Branching Map | `Network` | Small | View branching map |

### Gamification Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Points | `Trophy` | Large | Award points |
| Badge Trigger | `Award` | Small | Trigger badge |
| Achievement | `Medal` | Small | Add achievement |
| Leaderboard | `Users` | Small | Show leaderboard |
| Progress Milestone | `Target` | Small | Track milestone |
| Configure | `Gamepad2` | Small | Configure gamification |

### Triggers Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Trigger | `Zap` | Large | Add custom trigger |
| Time Trigger | `Timer` | Small | Time-based trigger |
| Scroll Trigger | `Flag` | Small | Scroll-based trigger |
| Completion Trigger | `CheckCircle` | Small | On completion trigger |

### Settings Group

| Control | Type | Options |
|---------|------|---------|
| Interaction Mode | Dropdown | Guided Mode, Explore Mode, Assessment Mode |
| Require Completion | Toggle | Toggle completion requirement |

---

## Tab 5: CLT (Cognitive Load Theory)

The CLT tab provides cognitive load analysis and optimization tools based on the INSPIRE methodology.

### Load Gauge Group

| Element | Type | Description |
|---------|------|-------------|
| Gauge Icon | `Gauge` | Visual load indicator |
| Progress Bar | Bar | Current load level (0-100) |
| Status Badge | Badge | optimal/moderate/high/overload |

**Load Status Colors:**
- Optimal (0-60): Green
- Moderate (61-75): Amber
- High (76-90): Orange
- Overload (91-100): Red

### 3-Component Model Group

| Component | Icon | Description |
|-----------|------|-------------|
| Intrinsic | `Brain` | Inherent complexity of content |
| Extraneous | `Lightbulb` | Unnecessary cognitive effort |
| Germane | `Target` | Effort toward learning |

Each shows a score (0-100) with color-coded indicators.

### Metrics Group

| Metric | Icon | Description |
|--------|------|-------------|
| Words | `FileText` | Total word count |
| Blocks | `Layers` | Number of content blocks |
| Interactive | `MousePointerClick` | Interactive element count |
| Duration | `Clock` | Estimated completion time |

### INSPIRE Stage Group

| Control | Type | Description |
|---------|------|-------------|
| Stage Dropdown | Select | Current lesson stage |

**INSPIRE Stages:**
- Investigate
- Navigate
- Structure
- Produce
- Implement
- Refine
- Evolve

### Actions Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Analyze | `BarChart3` | Large | Run CLT analysis |
| Optimize | `Zap` | Small | Auto-optimize load |

### Reports Group

| Tool | Icon | Action |
|------|------|--------|
| View Report | `FileText` | View detailed CLT report |
| History | `History` | View analysis history |
| Settings | `Settings2` | Configure CLT settings |

---

## Tab 6: AI Studio

The AI Studio tab provides AI-powered content generation and enhancement tools.

### Text-to-Speech Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| TTS | `Mic` | Large | Open TTS panel |
| Generate Narration | `AudioWaveform` | Small | Generate audio narration |
| Clone Voice | `Wand2` | Small | Clone a voice |
| Configure | `Settings2` | Small | TTS settings |

### Content Generation Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Generate | `Sparkles` | Large | AI content generation |
| Generate Quiz | `HelpCircle` | Small | Generate quiz questions |
| Generate Summary | `FileText` | Small | Generate content summary |
| Generate Outline | `List` | Small | Generate lesson outline |
| Expand | `PenLine` | Small | Expand content |
| Simplify | `Type` | Small | Simplify content |

### Image AI Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Generate | `ImagePlus` | Large | Generate image with AI |
| Alt Text | `Text` | Small | Generate alt text |
| Enhance | `Wand2` | Small | Enhance image |

### Video AI Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Captions | `Captions` | Large | Generate captions |
| Transcript | `FileSearch` | Small | Generate transcript |
| Chapters | `List` | Small | Generate chapters |

### Translation Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Translate | `Languages` | Large | Translate content |
| Language | Dropdown | - | Target language selector |
| Localize | `Globe` | Small | Localize content |

**Available Languages:**
- English, Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi

### Smart Suggestions Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Suggest | `Lightbulb` | Large | Get AI suggestions |
| Improve Clarity | `MessageSquare` | Small | Improve text clarity |
| Check Accessibility | `CheckCircle` | Small | A11y suggestions |
| Optimize CLT | `Brain` | Small | Optimize cognitive load |

### Settings Group

| Control | Type | Options |
|---------|------|---------|
| AI Model | Dropdown | Claude, GPT-4, Gemini |
| Configure | Button | AI configuration settings |

### Processing Indicator

When AI operations are running, a processing indicator appears:
- Spinning `RefreshCw` icon
- "Processing..." text

---

## Tab 7: Review

The Review tab provides quality assurance, collaboration, and publishing workflow tools.

### Preview Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Preview | `Eye` | Large | Preview in editor |
| Desktop | `Monitor` | Toggle | Desktop preview |
| Tablet | `Tablet` | Toggle | Tablet preview |
| Mobile | `Smartphone` | Toggle | Mobile preview |
| New Tab | `ExternalLink` | Small | Preview in new tab |
| Fullscreen | `PlayCircle` | Small | Fullscreen preview |
| Test as Learner | `TestTube` | Small | Test from learner perspective |

### Accessibility Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Check | `Accessibility` | Large | Run accessibility check |
| View Report | `FileCheck` | Small | View a11y report |
| Auto-Fix | `Zap` | Small | Auto-fix issues |
| Score Display | - | - | Shows accessibility % |

**Score Colors:**
- 90%+ : Green
- 70-89%: Amber
- Below 70%: Red

### Proofing Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Spelling | `SpellCheck` | Large | Check spelling |
| Grammar | `FileQuestion` | Small | Check grammar |
| Readability | `BookOpen` | Small | Check readability |

Error counts displayed when issues found.

### Comments Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Comments | `MessageSquare` | Large | Toggle comments panel |
| Add Comment | `MessageCircle` | Small | Add new comment |
| Resolve All | `CheckSquare` | Small | Resolve all comments |
| Count Badge | - | - | Shows comment count |

### History Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| History | `History` | Large | View version history |
| Compare | `Scale` | Small | Compare versions |
| Restore | `RefreshCw` | Small | Restore version |

### Workflow Group

| Control | Type | Options |
|---------|------|---------|
| Status | Dropdown | Draft, In Review, Approved, Published |

**Conditional Actions (based on status):**

*When Draft:*
| Tool | Icon | Action |
|------|------|--------|
| Submit for Review | `UserCheck` | Submit lesson for review |

*When In Review:*
| Tool | Icon | Color | Action |
|------|------|-------|--------|
| Approve | `CheckCircle` | Green | Approve lesson |
| Reject | `XCircle` | Red | Reject lesson |
| Request Changes | `AlertCircle` | Amber | Request changes |

### Share Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Share | `Share2` | Large | Share preview link |
| Export | `ExternalLink` | Small | Export for review |

### Quality Group

| Tool | Icon | Size | Action |
|------|------|------|--------|
| Run All | `ListChecks` | Large | Run all quality checks |
| Score Display | - | - | Shows quality score |

---

## Contextual Tabs

Contextual tabs appear automatically when specific content types are selected.

### Image Tools Tab

*Appears when an image block is selected*

| Group | Tools |
|-------|-------|
| Adjust | Brightness, Contrast, Saturation |
| Transform | Crop, Rotate, Flip |
| Effects | Filters, Blur, Sharpen |
| Alt Text | Generate, Edit |

### Video Tools Tab

*Appears when a video block is selected*

| Group | Tools |
|-------|-------|
| Playback | Start Time, End Time, Loop |
| Captions | Add, Edit, Auto-generate |
| Chapters | Add, Edit, Auto-generate |
| Accessibility | Transcript, Audio Description |

### Audio Tools Tab

*Appears when an audio block is selected*

| Group | Tools |
|-------|-------|
| Playback | Start, End, Loop, Speed |
| Waveform | Trim, Fade In/Out |
| Transcript | Generate, Edit |

### Quiz Tools Tab

*Appears when a quiz/assessment block is selected*

| Group | Tools |
|-------|-------|
| Question | Type, Points, Feedback |
| Options | Add, Remove, Shuffle |
| Scoring | Partial Credit, Attempts |
| Branching | Correct Path, Incorrect Path |

---

## Keyboard Shortcuts

### Global Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Cut | `Ctrl+X` |
| Copy | `Ctrl+C` |
| Paste | `Ctrl+V` |
| Preview | `Ctrl+P` |

### Tab Navigation

| Action | Shortcut |
|--------|----------|
| Next Tab | `Ctrl+Tab` |
| Previous Tab | `Ctrl+Shift+Tab` |
| Home Tab | `Alt+H` |
| Insert Tab | `Alt+I` |
| Design Tab | `Alt+D` |

---

## Component Reference

### Files Location

```
components/studio/lesson-editor/ribbon/
├── lesson-ribbon.tsx           # Main ribbon container
└── tabs/
    ├── home-tab.tsx            # Home tab
    ├── insert-tab.tsx          # Insert tab
    ├── design-tab.tsx          # Design tab
    ├── interactions-tab.tsx    # Interactions tab
    ├── clt-tab.tsx             # CLT tab
    ├── ai-studio-tab.tsx       # AI Studio tab
    └── review-tab.tsx          # Review tab
```

### Shared Ribbon Components

From `@/components/ribbon`:
- `RibbonButton` - Individual tool buttons
- `RibbonContent` - Tab content container
- `RibbonDropdown` - Selection dropdowns
- `RibbonGroup` - Tool grouping
- `RibbonSeparator` - Visual separators
- `RibbonToggleGroup` - Toggle button groups
- `RibbonColorPicker` - Color selection
- `RibbonCombobox` - Searchable selects
- `RibbonGallery` - Visual galleries

### Icon Library

All icons use **Lucide React** (`lucide-react`).

Standard icon styling: `text-sky-400` class for consistent light blue appearance.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-20 | Initial documentation |

---

*This documentation reflects the current state of the Lesson Editor Ribbon in the LXD360 Ecosystem.*
