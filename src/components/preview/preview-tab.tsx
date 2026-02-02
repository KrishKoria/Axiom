"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  TerminalSquareIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState, useCallback, useEffect, MouseEvent } from "react";
import { useProject } from "@/hooks/use-projects";
import { Id } from "../../../convex/_generated/dataModel";
import { useWebContainer } from "@/hooks/use-webcontainers";
import { PreviewSettingsPopover } from "./preview-settings";
import { Allotment } from "allotment";
import { PreviewTerminal } from "./preview-terminal";
import { useRouter } from "next/navigation";
import {
  DeviceSwitcher,
  DeviceType,
  DEVICE_CONFIGS,
} from "./device-switcher";

export default function PreviewTabContent({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const router = useRouter();
  const project = useProject(projectId);
  const [showTerminal, setShowTerminal] = useState(true);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [copied, setCopied] = useState(false);

  const { status, previewUrl, error, restart, terminalOutput } =
    useWebContainer({
      projectId,
      enabled: true,
      settings: project?.settings,
    });

  const isLoading = status === "booting" || status === "installing";
  const isStreaming = status === "installing";

  const handleCopyUrl = async () => {
    if (!previewUrl) return;
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = useCallback(
    (e: MouseEvent) => {
      // Ctrl/Cmd+click opens in new browser tab
      if (e.metaKey || e.ctrlKey) {
        window.open(`/preview/${projectId}`, "_blank");
      } else {
        // Normal click navigates in same tab
        router.push(`/preview/${projectId}`);
      }
    },
    [router, projectId]
  );

  // Keyboard shortcut for Cmd/Ctrl + Shift + P to open preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        router.push(`/preview/${projectId}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, projectId]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Preview Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        {/* Left: URL Bar and Actions */}
        <div className="flex items-center gap-2">
          {/* URL Bar */}
          <div className="group flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md min-w-64 transition-colors hover:border-border/80">
            <div
              className={cn(
                "size-2 rounded-full transition-colors",
                error
                  ? "bg-destructive"
                  : previewUrl
                    ? "bg-success"
                    : isLoading
                      ? "bg-ai animate-ai-pulse"
                      : "bg-muted-foreground"
              )}
            />
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2Icon className="size-3 animate-spin" />
                <span>{status === "booting" ? "Starting..." : "Installing..."}</span>
              </div>
            )}
            {previewUrl && (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-48">
                {previewUrl}
              </span>
            )}
            {!isLoading && !previewUrl && !error && (
              <span className="text-xs text-muted-foreground">Ready to preview</span>
            )}
            {error && (
              <span className="text-xs text-destructive truncate max-w-48">Error</span>
            )}
            {/* Copy button - appears on hover */}
            {previewUrl && (
              <button
                onClick={handleCopyUrl}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
                title="Copy URL"
              >
                {copied ? (
                  <CheckIcon className="size-3 text-success" />
                ) : (
                  <CopyIcon className="size-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            disabled={isLoading}
            onClick={restart}
            title="Restart container"
          >
            <RefreshCwIcon
              className={cn("size-4", isLoading && "animate-spin")}
            />
          </Button>

          {/* Open Full Preview */}
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={handleOpenExternal}
            title="Open full preview (Ctrl+click for new tab)"
          >
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>

        {/* Right: Device Switcher and Settings */}
        <div className="flex items-center gap-2">
          <DeviceSwitcher value={device} onChange={setDevice} />

          <div className="w-px h-5 bg-border" />

          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "size-8 p-0",
              showTerminal && "bg-accent text-accent-foreground"
            )}
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

      {/* Preview Content */}
      <div className="flex-1 min-h-0">
        <Allotment vertical>
          <Allotment.Pane>
            {/* Preview Frame Container */}
            <div
              className={cn(
                "size-full flex items-start justify-center overflow-auto",
                device !== "desktop" && "bg-muted/20 p-4"
              )}
            >
              {error && (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center">
                    <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangleIcon className="size-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Preview Error
                      </p>
                      <p className="text-xs text-muted-foreground">{error}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={restart}>
                      <RefreshCwIcon className="size-4" />
                      Restart
                    </Button>
                  </div>
                </div>
              )}

              {isLoading && !error && (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3 max-w-md mx-auto text-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full animate-ai-pulse" />
                      <Loader2Icon className="size-8 animate-spin text-ai relative z-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {status === "booting"
                          ? "Starting container..."
                          : "Installing dependencies..."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This may take a moment
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {previewUrl && !error && (
                <div
                  className={cn(
                    "h-full transition-all duration-200",
                    device === "desktop" && "w-full",
                    device !== "desktop" &&
                      "rounded-lg border border-border bg-background shadow-lg overflow-hidden"
                  )}
                  style={{
                    width:
                      device === "desktop"
                        ? "100%"
                        : DEVICE_CONFIGS[device].width,
                    maxWidth: "100%",
                  }}
                >
                  <iframe
                    src={previewUrl}
                    className="size-full border-0 bg-white"
                    title="Preview"
                  />
                </div>
              )}

              {!previewUrl && !isLoading && !error && (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-sm">No preview available</p>
                    <p className="text-xs text-muted-foreground/70">
                      Start the dev server to see your preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Allotment.Pane>

          {showTerminal && (
            <Allotment.Pane minSize={100} maxSize={500} preferredSize={200}>
              <div className="h-full flex flex-col bg-background border-t border-border">
                {/* Terminal Header */}
                <div
                  className={cn(
                    "group h-8 flex items-center justify-between px-3 border-b shrink-0 transition-colors",
                    isStreaming
                      ? "border-ai/30 bg-ai/5"
                      : "border-border/50 bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <TerminalSquareIcon
                      className={cn(
                        "size-3.5",
                        isStreaming ? "text-ai" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        isStreaming ? "text-ai" : "text-muted-foreground"
                      )}
                    >
                      Terminal
                    </span>
                    {isStreaming && (
                      <span className="flex items-center gap-1 text-ai/70">
                        <span className="size-1.5 rounded-full bg-ai animate-ai-pulse" />
                        <span className="text-[10px]">Running</span>
                      </span>
                    )}
                  </div>

                  {/* Terminal Actions - hover visible */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      title="Copy output"
                      onClick={() => navigator.clipboard.writeText(terminalOutput)}
                    >
                      <CopyIcon className="size-3 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-6 p-0"
                      title="Clear terminal"
                      onClick={restart}
                    >
                      <Trash2Icon className="size-3 text-muted-foreground" />
                    </Button>
                  </div>
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
