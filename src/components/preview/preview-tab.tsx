import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  TerminalSquareIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useProject } from "@/hooks/use-projects";
import { Id } from "../../../convex/_generated/dataModel";
import { useWebContainer } from "@/hooks/use-webcontainers";
import { PreviewSettingsPopover } from "./preview-settings";
import { Allotment } from "allotment";
import { PreviewTerminal } from "./preview-terminal";

export default function PreviewTabContent({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const project = useProject(projectId);
  const [showTerminal, setShowTerminal] = useState(true);

  const { status, previewUrl, error, restart, terminalOutput } =
    useWebContainer({
      projectId,
      enabled: true,
      settings: project?.settings,
    });

  const isLoading = status === "booting" || status === "installing";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Preview Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {/* URL Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md min-w-64">
            <div className="size-2 rounded-full bg-success" />
            {isLoading && (
              <div className="flex items-center gap-1.5">
                <Loader2Icon className="size-3 animate-spin" />
                {status === "booting" ? "Starting..." : "Installing..."}
              </div>
            )}
            {previewUrl && (
              <span className="text-xs text-muted-foreground font-mono">
                {previewUrl}
              </span>
            )}
            {!isLoading && !previewUrl && !error && (
              <span>Ready to preview</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            disabled={isLoading}
            onClick={restart}
            title="Restart The Container"
          >
            <RefreshCwIcon
              className={cn("size-4", isLoading && "animate-spin")}
            />
          </Button>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <ExternalLinkIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-full rounded-none"
            title="Toggle terminal"
            onClick={() => setShowTerminal((value) => !value)}
          >
            <TerminalSquareIcon className="size-4" />
          </Button>
          <PreviewSettingsPopover
            projectId={projectId}
            initialValues={project?.settings}
            onSave={restart}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Allotment vertical>
          <Allotment.Pane>
            {error && (
              <div className="size-full flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <AlertTriangleIcon className="size-6" />
                  <p className="text-sm font-medium">{error}</p>
                  <Button size="sm" variant="outline" onClick={restart}>
                    <RefreshCwIcon className="size-4" />
                    Restart
                  </Button>
                </div>
              </div>
            )}

            {isLoading && !error && (
              <div className="size-full flex items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center">
                  <Loader2Icon className="size-6 animate-spin" />
                  <p className="text-sm font-medium">Installing...</p>
                </div>
              </div>
            )}

            {previewUrl && (
              <iframe
                src={previewUrl}
                className="size-full border-0"
                title="Preview"
              />
            )}
          </Allotment.Pane>

          {showTerminal && (
            <Allotment.Pane minSize={100} maxSize={500} preferredSize={200}>
              <div className="h-full flex flex-col bg-background border-t">
                <div className="h-7 flex items-center px-3 text-xs gap-1.5 text-muted-foreground border-b border-border/50 shrink-0">
                  <TerminalSquareIcon className="size-3" />
                  Terminal
                </div>
                <PreviewTerminal output={terminalOutput} />
              </div>
            </Allotment.Pane>
          )}
        </Allotment>
      </div>
    </div>
  );
}
