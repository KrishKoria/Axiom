import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "./extensions/theme";
import { getLanguageExtension } from "./extensions/language";
import { indentWithTab } from "@codemirror/commands";
import { minimap } from "./extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { customSetup } from "./extensions/custom-setup";
import { suggestion } from "./extensions/suggestions";
import { quickEdit } from "./extensions/quick-edit";
import { selectionTooltip } from "./extensions/selection-tooltip";
interface CodeEditorProps {
  filename: string;
  initialValue?: string;
  onChange: (value: string) => void;
}
export default function CodeEditor({
  filename,
  initialValue = "",
  onChange,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageExtensions = useMemo(
    () => getLanguageExtension(filename),
    [filename],
  );
  useEffect(() => {
    if (!editorRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        customSetup,
        oneDark,
        customTheme,
        languageExtensions,
        minimap(),
        suggestion(filename),
        quickEdit(filename),
        selectionTooltip(),
        keymap.of([indentWithTab]),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;
    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageExtensions]);
  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
}
