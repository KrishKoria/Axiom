import { EditorView } from "@codemirror/view";

export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
    height: "100%",
    backgroundColor: "oklch(0.17 0.02 284)",
    color: "oklch(0.92 0.03 286)",
  },

  // Content and font
  ".cm-content": {
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "14px",
    caretColor: "oklch(0.72 0.16 290)",
  },

  // Cursor/caret
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "oklch(0.72 0.16 290)",
    borderLeftWidth: "2px",
  },

  // Gutter styling
  ".cm-gutters": {
    backgroundColor: "oklch(0.15 0.02 284)",
    color: "oklch(0.50 0.02 286)",
    border: "none",
    borderRight: "1px solid oklch(0.25 0.03 284)",
  },

  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "40px",
    padding: "0 8px 0 16px",
    color: "oklch(0.50 0.02 286)",
  },

  ".cm-activeLineGutter": {
    backgroundColor: "oklch(0.20 0.04 284)",
    color: "oklch(0.72 0.16 290)",
  },

  // Active line highlight
  ".cm-activeLine": {
    backgroundColor: "rgba(139, 92, 246, 0.08)",
  },

  // Selection
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "rgba(139, 92, 246, 0.25) !important",
  },

  ".cm-selectionMatch": {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },

  // Matching brackets
  "&.cm-focused .cm-matchingBracket": {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    outline: "1px solid oklch(0.75 0.12 195)",
    color: "inherit",
  },

  "&.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    outline: "1px solid rgb(239, 68, 68)",
  },

  // Search results
  ".cm-searchMatch": {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    outline: "1px solid oklch(0.72 0.16 290)",
  },

  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(139, 92, 246, 0.35)",
  },

  // Fold gutters
  ".cm-foldGutter": {
    width: "16px",
  },

  ".cm-foldGutter .cm-gutterElement": {
    textAlign: "center",
    cursor: "pointer",
    opacity: 0.6,
  },

  ".cm-foldGutter .cm-gutterElement:hover": {
    opacity: 1,
    color: "oklch(0.72 0.16 290)",
  },

  // Scrollbar styling
  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "oklch(0.35 0.05 286) transparent",
  },

  ".cm-scroller::-webkit-scrollbar": {
    width: "10px",
    height: "10px",
  },

  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },

  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "oklch(0.35 0.05 286)",
    borderRadius: "5px",
    border: "2px solid transparent",
    backgroundClip: "padding-box",
  },

  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "oklch(0.45 0.06 286)",
  },

  // Tooltip styling
  ".cm-tooltip": {
    backgroundColor: "oklch(0.20 0.03 284)",
    border: "1px solid oklch(0.30 0.05 284)",
    borderRadius: "6px",
    boxShadow: "0px 4px 10px 0px hsl(240 30% 25% / 0.12)",
    color: "oklch(0.92 0.03 286)",
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "13px",
    padding: "4px 8px",
  },

  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "var(--font-plex-mono), monospace",
    },
    "& > ul > li[aria-selected]": {
      backgroundColor: "oklch(0.72 0.16 290)",
      color: "oklch(0.98 0.01 286)",
    },
  },

  // Focus visible - subtle glow
  "&.cm-focused": {
    outline: "none",
  },

  // Panel styling (search, replace, etc.)
  ".cm-panel": {
    backgroundColor: "oklch(0.18 0.02 284)",
    borderTop: "1px solid oklch(0.25 0.03 284)",
    color: "oklch(0.92 0.03 286)",
  },

  ".cm-panel input": {
    backgroundColor: "oklch(0.22 0.03 284)",
    border: "1px solid oklch(0.30 0.04 284)",
    borderRadius: "4px",
    color: "oklch(0.92 0.03 286)",
    padding: "4px 8px",
    fontFamily: "var(--font-plex-mono), monospace",
  },

  ".cm-panel input:focus": {
    outline: "none",
    borderColor: "oklch(0.72 0.16 290)",
    boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)",
  },

  ".cm-panel button": {
    backgroundColor: "oklch(0.72 0.16 290)",
    border: "none",
    borderRadius: "4px",
    color: "oklch(0.98 0.01 286)",
    padding: "4px 12px",
    cursor: "pointer",
    fontFamily: "var(--font-plex-mono), monospace",
  },

  ".cm-panel button:hover": {
    backgroundColor: "oklch(0.68 0.16 290)",
  },
});
