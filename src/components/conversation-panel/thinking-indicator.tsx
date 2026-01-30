import { SparklesIcon } from "lucide-react";

export default function ThinkingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3 bg-muted/30">
      <div className="shrink-0 size-7 rounded-lg flex items-center justify-center bg-ai/15 text-ai ring-1 ring-ai/20 animate-ai-pulse">
        <SparklesIcon className="size-3.5" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs font-medium text-ai">Axiom</span>
        <div className="flex gap-1">
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}
