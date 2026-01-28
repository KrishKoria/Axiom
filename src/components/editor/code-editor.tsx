import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "./extensions/theme";
import { getLanguageExtension } from "./extensions/language";
import { indentWithTab } from "@codemirror/commands";
import { minimap } from "./extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
interface CodeEditorProps {
  filename: string;
}
export default function CodeEditor({ filename }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageExtensions = useMemo(
    () => getLanguageExtension(filename),
    [filename],
  );
  useEffect(() => {
    if (!editorRef.current) return;
    const view = new EditorView({
      doc: "Start coding...",
      parent: editorRef.current,
      extensions: [
        basicSetup,
        oneDark,
        customTheme,
        languageExtensions,
        minimap(),
        keymap.of([indentWithTab]),
        indentationMarkers(),
      ],
    });
    viewRef.current = view;
    return () => {
      view.destroy();
    };
  }, [languageExtensions]);
  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
}
