import { cn } from "@/lib/utils";
import { Command } from "lucide-react";

export function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <div className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium font-mono"
        >
          {key === "cmd" ? <Command className="size-3.5" /> : key}
        </kbd>
      ))}
    </div>
  );
}

export function ActionCard({
  icon: Icon,
  title,
  shortcut,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  shortcut: string[];
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-5 p-5 rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/50 hover:bg-card/80",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "w-56",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Icon className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        <KeyboardShortcut keys={shortcut} />
      </div>
      <span className="text-base font-medium">{title}</span>
    </button>
  );
}
