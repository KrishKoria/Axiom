"use client";

import { cn } from "@/lib/utils";
import { AlertTriangleIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { useWebContainer } from "@/hooks/use-webcontainers";
import { useProject } from "@/hooks/use-projects";
import { FloatingToolbar } from "./floating-toolbar";
import { DeviceType, DEVICE_CONFIGS } from "./device-switcher";

interface PreviewFullscreenProps {
  projectId: Id<"projects">;
}

export const PreviewFullscreen = ({ projectId }: PreviewFullscreenProps) => {
  const router = useRouter();
  const project = useProject(projectId);
  const [device, setDevice] = useState<DeviceType>("desktop");

  const { status, previewUrl, error, restart } = useWebContainer({
    projectId,
    enabled: true,
    settings: project?.settings,
  });

  const isLoading = status === "booting" || status === "installing";

  // Handle project not found
  const projectNotFound = project === null;

  // Keyboard shortcut for toggling between preview and editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + P to toggle
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        router.push(`/projects/${projectId}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, projectId]);

  // Error page for project not found
  if (projectNotFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center p-8">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangleIcon className="size-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Project not found
            </h1>
            <p className="text-sm text-muted-foreground">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Loading state while project data is being fetched
  if (project === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Toolbar */}
      <FloatingToolbar
        projectId={projectId}
        previewUrl={previewUrl}
        device={device}
        onDeviceChange={setDevice}
        onRefresh={restart}
        isLoading={isLoading}
      />

      {/* Preview Content - Full viewport */}
      <div
        className={cn(
          "min-h-screen w-full flex items-start justify-center",
          device !== "desktop" && "bg-muted/20 pt-20 pb-8"
        )}
      >
        {/* Error state */}
        {error && (
          <div className="min-h-screen w-full flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center">
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangleIcon className="size-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  Preview Error
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={restart}>
                <RefreshCwIcon className="size-4" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="min-h-screen w-full flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full animate-ai-pulse" />
                <Loader2Icon className="size-10 animate-spin text-ai relative z-10" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  {status === "booting"
                    ? "Starting container..."
                    : "Installing dependencies..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview iframe */}
        {previewUrl && !error && (
          <div
            className={cn(
              "transition-all duration-200",
              device === "desktop" && "w-full min-h-screen",
              device !== "desktop" &&
                "rounded-lg border border-border bg-background shadow-lg overflow-hidden"
            )}
            style={{
              width:
                device === "desktop" ? "100%" : DEVICE_CONFIGS[device].width,
              height: device === "desktop" ? "100vh" : "80vh",
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

        {/* Idle state - no preview yet */}
        {!previewUrl && !isLoading && !error && (
          <div className="min-h-screen w-full flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm">No preview available</p>
              <p className="text-xs text-muted-foreground/70">
                The dev server will start automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
