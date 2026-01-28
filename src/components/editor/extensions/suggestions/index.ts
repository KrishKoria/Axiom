import { fetcher } from "@/components/editor/extensions/suggestions/fetcher";
import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
const setSuggestionEffect = StateEffect.define<string | null>();
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

class SuggestionWidget extends WidgetType {
  constructor(private suggestion: string) {
    super();
  }
  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.suggestion;
    span.style.opacity = "0.5";
    span.style.pointerEvents = "none";
    span.style.fontStyle = "italic";
    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const DEBOUNCE_DELAY = 300; // milliseconds
let currentAbortController: AbortController | null = null;

const generatePayload = (view: EditorView, fileName: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(8, currentLine.number - 1);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(8, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  };
};

const debouncePlugin = (filename: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        this.requestSuggestion(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.requestSuggestion(update.view);
        }
      }
      requestSuggestion(view: EditorView) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        if (currentAbortController !== null) {
          currentAbortController.abort();
        }
        isWaitingForSuggestion = true;
        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, filename);
          if (!payload) {
            isWaitingForSuggestion = false;
            view.dispatch({ effects: setSuggestionEffect.of(null) });
            return;
          }
          currentAbortController = new AbortController();
          const suggestion = await fetcher(
            payload,
            currentAbortController.signal,
          );
          isWaitingForSuggestion = false;
          view.dispatch({
            effects: setSuggestionEffect.of(suggestion),
          });
        }, DEBOUNCE_DELAY);
      }
      destroy() {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        if (currentAbortController !== null) {
          currentAbortController.abort();
        }
      }
    },
  );
};

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(private view: EditorView) {
      this.decorations = this.build(view);
    }
    update(update: ViewUpdate) {
      const suggestionChanges = update.transactions.some((tr) =>
        tr.effects.some((e) => e.is(setSuggestionEffect)),
      );
      // should rebuild decorations if doc changed, selection changed, or suggestion changed
      if (update.docChanged || update.selectionSet || suggestionChanges) {
        this.decorations = this.build(update.view);
      }
    }
    build(view: EditorView) {
      const suggestion = view.state.field(suggestionState);

      if (!suggestion) {
        return Decoration.none;
      }
      const cursorPos = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // render after the cursor
        }).range(cursorPos),
      ]);
    }
  },
  { decorations: (v) => v.decorations },
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view: EditorView) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false;
      }
      const cursorPos = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursorPos, insert: suggestion },
        selection: { anchor: cursorPos + suggestion.length },
        effects: setSuggestionEffect.of(null), // clear suggestion after accepting
      });
      return true;
    },
  },
]);

export const suggestion = (filename: string) => [
  suggestionState, // editor state field to hold current suggestion
  debouncePlugin(filename), // to fetch suggestion with debounce
  renderPlugin, // to render the suggestion
  acceptSuggestionKeymap, // keymap to accept suggestion
];
