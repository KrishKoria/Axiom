# Axiom Design System

> The next-gen AI code editor for the modern developer

## Intent

**Who:** Indie hackers building MVPs, shipping fast. The AI isn't a tool — it's a co-founder.

**What they do:** Turn ideas into working code at the speed of thought.

**Feel:** Futuristic — fast, flashy, cutting-edge. This is shipping from tomorrow.

---

## Color Palette

### Foundation: Violet (Creativity, Imagination)

- Primary: `oklch(0.54 0.18 288)` (light) / `oklch(0.72 0.16 290)` (dark)
- Used for: Brand elements, primary actions, focus states

### Accent: Cyan (AI, Intelligence)

- AI: `oklch(0.70 0.15 195)` (light) / `oklch(0.75 0.12 195)` (dark)
- Used for: AI avatars, AI message accents, thinking states, the "living seam"

### Surfaces

- Background: Deep purple-tinted neutrals
- Cards/Sidebar: Slightly elevated from background
- Muted: For secondary text and disabled states

### Semantic

- Destructive: `oklch(0.69 0.21 15)` — Error states
- Success: `oklch(0.72 0.17 142)` (light) / `oklch(0.75 0.15 142)` (dark) — Success states, online indicators
- Warning: Amber (not yet defined)

> **Note:** Use `text-destructive` and `text-success` tokens instead of hardcoded colors like `text-red-500` or `text-green-500`.

---

## Typography

### Fonts

- **Sans:** Geist — Clean, modern, geometric
- **Mono:** IBM Plex Mono — Excellent code readability, technical feel

### Scale

- Base: 14px (0.875rem)
- Small: 12px (0.75rem) — Labels, hints
- XS: 10px — Keyboard shortcuts, micro-text

### Weights

- Regular (400): Body text
- Medium (500): Labels, navigation
- Semibold (600): Headings
- Bold (700): Emphasis

---

## Spacing

Base unit: 4px

| Token | Value | Use             |
| ----- | ----- | --------------- |
| 1     | 4px   | Micro gaps      |
| 1.5   | 6px   | Fine adjustments (py-1.5, gap-1.5) |
| 2     | 8px   | Tight spacing   |
| 2.5   | 10px  | Icon containers (size-2.5) |
| 3     | 12px  | Default gap     |
| 4     | 16px  | Section padding |
| 5     | 20px  | Card padding    |
| 6     | 24px  | Large gaps      |
| 8     | 32px  | Section margins |

> **Note:** While 4px is the base unit, 6px (1.5) and 10px (2.5) are acceptable for fine-tuning vertical rhythm and icon sizing.

---

## Depth & Elevation

### Approach: Layered with subtle glows

1. **Base layer** — Background surface
2. **Card layer** — Sidebar, cards, elevated panels
3. **Floating layer** — Popovers, dialogs, tooltips

### Shadows

Purple-tinted shadows for warmth:

```css
--shadow-sm: 0px 4px 10px 0px hsl(240 30% 25% / 0.12);
```

### Borders

Subtle, 1px, using `--border` token. No heavy outlines.

### AI Glow Effect

```css
--ai-glow: oklch(0.75 0.12 195 / 0.25);
box-shadow: 0 0 12px 2px var(--ai-glow);
```

---

## Components

### Message Bubbles

**User messages:**

- No background
- Primary-colored avatar ring
- Left-aligned with avatar

**AI messages:**

- Subtle muted background (`bg-muted/30`)
- Cyan avatar with sparkle icon
- Cyan accent on label
- Glow effect on latest message

### Input Fields

- Rounded-lg (8px radius)
- Border with subtle shadow on focus
- AI-colored focus ring for chat input
- Auto-resize for textarea

```tsx
className={cn(
  "w-full resize-none rounded-lg border border-input bg-background px-4 py-3",
  "text-sm placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai/50",
  "transition-all duration-200"
)}
```

### Buttons

- Primary: Filled with primary color
- Ghost: Transparent, hover shows accent
- Outline: Border with transparent background (used for secondary actions like Export)
- AI actions: Cyan background

**Sizes:**
- `sm`: `h-8` or `size-8 p-0` for icon buttons
- `default`: Standard padding

### Cards

```
p-5 rounded-xl border border-border shadow-sm
hover:shadow-md transition-shadow (for interactive cards)
```

- Default padding: 20px (p-5)
- Border radius: rounded-xl (12px)
- Always use `border-border` token
- Add hover shadow for clickable cards

### Keyboard Shortcuts

```tsx
<kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
  Ctrl+K
</kbd>
```

- Background: `bg-muted`
- Text: 10px monospace
- Padding: 6px horizontal, 2px vertical
- Border radius: default rounded

### Panel Tabs

Top-level navigation within the code panel.

```
┌─────────────────────────────────────────────────────┐
│ [Code] [Preview]                    [Export button] │
└─────────────────────────────────────────────────────┘
```

- Ghost buttons with bottom border indicator
- Active Code tab: violet `border-primary`
- Active Preview tab: cyan `border-ai`
- Tabs aligned left, actions aligned right with flex spacer
- `rounded-none` on tab buttons for clean edge alignment

### Editor Tabs (File Tabs)

Tab bar for open files in the code editor.

```
┌─────────────────────────────────────────────────────────────┐
│ [📄 index.tsx •×] [📄 styles.css] [+]                       │
│  ↑ active + modified  ↑ inactive    ↑ new tab              │
└─────────────────────────────────────────────────────────────┘
```

**Container:**

```tsx
className="flex items-center gap-0 border-b border-border bg-muted/30 overflow-x-auto"
```

**Active tab:**

```tsx
className={cn(
  "group flex items-center gap-1 px-3 py-1.5 text-sm",
  "border-r border-border bg-background",
)}
```

- Elevated with `bg-background` against `bg-muted/30` container
- Right border separates from adjacent tabs
- Close button always visible

**Inactive tab:**

```tsx
className={cn(
  "group flex items-center gap-1 px-3 py-1.5 text-sm",
  "text-muted-foreground hover:bg-accent/50 transition-colors",
)}
```

- Muted text, no background
- Close button visible on hover only (smart visibility)

**Close button:**

```tsx
<button
  className={cn(
    "ml-1 size-4 flex items-center justify-center rounded hover:bg-accent",
    !isActive && "opacity-0 group-hover:opacity-100 transition-opacity",
  )}
>
  <XIcon className="size-3 text-muted-foreground" />
</button>
```

**Modified indicator:**

```tsx
// Show dot before close button when file has unsaved changes
{isModified && (
  <span className="size-1.5 rounded-full bg-primary" />
)}
```

- Small violet dot indicates unsaved changes
- Positioned before the close button
- Uses `bg-primary` to match brand color

**New tab button:**

```tsx
<button className="ml-1 px-2 py-1.5 hover:bg-accent/50 transition-colors">
  <PlusIcon className="size-4 text-muted-foreground" />
</button>
```

**File icons:**
- Size: `size-3.5`
- Color: `text-muted-foreground`
- Use file-type specific icons when available

---

### Device Switcher (Preview)

Segmented control for responsive preview.

```
┌─────────────────────────┐
│ [🖥] [📱] [📱]          │
└─────────────────────────┘
```

- Container: `bg-muted rounded-lg p-1`
- Active: `bg-background shadow-sm`
- Icons: Monitor, Tablet, Smartphone
- Devices: desktop (100%), tablet (768px), mobile (375px)

### The Living Seam (Split Pane Gutter)

- Default: 1px border line
- Hover/Active: 3px cyan with glow
- AI Thinking: Pulsing cyan glow animation

### File Explorer

**Header row:**

```tsx
// Explorer header with hover-visible actions
<div className="group shrink-0 flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
    Explorer
  </span>
  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
    {/* New File / New Folder buttons */}
  </div>
</div>
```

**Tree item wrapper:**

```tsx
className={cn(
  // Base: full width, fixed height, smooth transitions
  "group flex items-center gap-1 w-full h-6 transition-colors duration-150",
  // Hover: slightly visible accent background
  "hover:bg-accent/40",
  // Focus: violet ring with subtle background
  "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-accent/20",
  // Active/selected: background + left border indicator
  isActive && "bg-accent/30 border-l-2 border-primary",
)}
```

**Project row:**
- Use `font-semibold` on project name for visual hierarchy
- Chevron with `transition-transform duration-150` for smooth expand/collapse

**Create/Rename input:**

```tsx
className="flex-1 bg-transparent text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-primary/50 focus:bg-accent/10"
```

**Loading state:**
- Match `h-6` height of regular items
- Use `animate-pulse` for subtle loading indication
- Spinner with `text-muted-foreground`

**Action buttons (hover-visible):**

```tsx
<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
  <Button variant="highlight" className="size-5 flex items-center justify-center rounded hover:bg-accent">
    <FilePlus2Icon className="size-3.5 text-muted-foreground" />
  </Button>
</div>
```

---

## Animation

### Timing

- Fast: 150ms — Hovers, micro-interactions
- Default: 200ms — State changes
- Slow: 300ms — Layout shifts

### Easing

- Default: `ease-out`
- Bouncy: `cubic-bezier(0.34, 1.56, 0.64, 1)`

### AI-Specific Animations

**ai-pulse** — For AI avatar when thinking

```css
@keyframes ai-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--ai-glow);
  }
  50% {
    box-shadow: 0 0 12px 2px var(--ai-glow);
  }
}
```

**ai-thinking** — For typing indicators, dots

```css
@keyframes ai-thinking {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
```

---

## Layout Patterns

### Editor Layout

```
┌─────────────────────────────────────────────────────────┐
│ Navbar (sticky, border-bottom)                          │
├─────────────────┬───────────────────────────────────────┤
│ Conversation    │ [Code] [Preview]           [Export]   │
│ (280-600px)     ├───────────────────────────────────────┤
│                 │ CODE TAB:                             │
│                 │ ┌───────┬─────────────────────────┐   │
│                 │ │ Tree  │ File Tabs               │   │
│                 │ │(224px)├─────────────────────────┤   │
│                 │ │       │ Code Editor (flex-1)    │   │
│                 │ │       ├─────────────────────────┤   │
│                 │ │       │ Terminal (192px)        │   │
│                 │ └───────┴─────────────────────────┘   │
│                 │                                       │
│                 │ PREVIEW TAB:                          │
│                 │ ┌─────────────────────────────────┐   │
│                 │ │ URL bar  [↻] [↗]    [🖥][📱][📱]│   │
│                 │ ├─────────────────────────────────┤   │
│                 │ │                                 │   │
│                 │ │     Live Preview Frame          │   │
│                 │ │     (responsive device size)    │   │
│                 │ │                                 │   │
│                 │ └─────────────────────────────────┘   │
└─────────────────┴───────────────────────────────────────┘
```

### Split Pane Defaults

- Conversation: 400px preferred, 280-600px range
- Code panel: Fills remaining space
- File tree: 224px (14rem)
- Terminal: 192px (12rem)

### Preview Panel

- Toolbar: URL bar + refresh + external link + device switcher
- Frame: Centered with responsive width based on device
- Background: `bg-muted/20` to differentiate from content
- Device frames: White background with shadow, rounded corners

---

## Signature Elements

1. **Cyan AI accents** — Immediately identifies AI-generated or AI-related content
2. **The living seam** — The gutter pulses when AI is thinking
3. **Sparkle icon** — AI avatar, new/create actions
4. **Purple-to-cyan gradient moments** — Brand transitions

---

## Dark Mode (Primary)

Dark mode is the default experience. The futuristic feel is strongest in dark.

- Background: `oklch(0.17 0.02 284)`
- Foreground: `oklch(0.92 0.03 286)`
- Increased glow visibility
- Higher contrast for accessibility

Light mode is available but secondary.

---

## Do / Don't

### Do

- Use cyan sparingly — only for AI moments
- Maintain generous whitespace
- Let the content breathe
- Use keyboard shortcuts liberally
- Animate with purpose

### Don't

- Overuse glow effects
- Mix violet and cyan in the same element
- Use pure black or white
- Add borders where shadows suffice
- Animate everything
