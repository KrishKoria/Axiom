import { showMinimap } from "@replit/codemirror-minimap";
import type { EditorView } from "@codemirror/view";

const createMinimap = (view: EditorView) => {
  const dom = document.createElement("div");
  return { dom };
};

export const minimap = () => [
  showMinimap.compute(["doc"], () => {
    return {
      create: createMinimap,
      displayText: "blocks",
      showOverlay: "always",
    };
  }),
];
