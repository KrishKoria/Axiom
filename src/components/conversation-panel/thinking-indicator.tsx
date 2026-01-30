import { SparklesIcon } from "lucide-react";

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Pulsing orb container */}
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-ai/20 blur-md animate-ai-pulse" />
        <div className="relative size-8 rounded-lg bg-linear-to-br from-ai/20 to-ai/10 flex items-center justify-center ring-1 ring-ai/30 backdrop-blur-sm">
          <SparklesIcon className="size-3.5 text-ai animate-pulse" />
        </div>
      </div>

      {/* Thinking content */}
      <div className="flex-1 pt-1.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-ai/80 tracking-wide uppercase">
            Thinking
          </span>
          <div className="flex gap-1.5">
            <span
              className="size-1.5 rounded-full bg-ai animate-[ai-thinking-bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="size-1.5 rounded-full bg-ai animate-[ai-thinking-bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "160ms" }}
            />
            <span
              className="size-1.5 rounded-full bg-ai animate-[ai-thinking-bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "320ms" }}
            />
          </div>
        </div>

        {/* Subtle progress line */}
        <div className="mt-3 h-px w-24 bg-linear-to-r from-ai/40 via-ai/20 to-transparent overflow-hidden rounded-full">
          <div className="h-full w-8 bg-ai/60 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full" />
        </div>
      </div>
    </div>
  );
}
