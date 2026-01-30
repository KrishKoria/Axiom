import { cn } from "@/lib/utils";
import { Loader2Icon, SparklesIcon, UserIcon } from "lucide-react";

export default function MessageBubble({
  message,
  isLatest,
}: {
  message: Message;
  isLatest: boolean;
}) {
  const isAI = message.role === "assistant";

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3 transition-colors",
        isAI && "bg-muted/30",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 size-7 rounded-lg flex items-center justify-center",
          isAI
            ? "bg-ai/15 text-ai ring-1 ring-ai/20"
            : "bg-primary/10 text-primary ring-1 ring-primary/20",
        )}
      >
        {isAI ? (
          <SparklesIcon className="size-3.5" />
        ) : (
          <UserIcon className="size-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              isAI ? "text-ai" : "text-primary",
            )}
          >
            {isAI ? "Axiom" : "You"}
          </span>
          {message.isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground animate-ai-thinking">
              <Loader2Icon className="size-3 animate-spin" />
              thinking...
            </span>
          )}
        </div>
        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            message.isStreaming &&
              isLatest &&
              "after:inline-block after:w-1.5 after:h-4 after:bg-ai after:ml-0.5 after:animate-ai-thinking after:rounded-sm",
          )}
        >
          {message.content}
        </div>
      </div>

      {/* AI glow effect for latest AI message */}
      {isAI && isLatest && !message.isStreaming && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-linear-to-b from-transparent via-ai/50 to-transparent" />
        </div>
      )}
    </div>
  );
}
