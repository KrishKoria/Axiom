"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DeviceSwitcher, DeviceType } from "./device-switcher";

interface FloatingToolbarProps {
  projectId: string;
  previewUrl: string | null;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const FloatingToolbar = ({
  projectId,
  previewUrl,
  device,
  onDeviceChange,
  onRefresh,
  isLoading,
}: FloatingToolbarProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-hide after 3 seconds of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    // Initial timer
    resetTimer();

    // Mouse movement handler
    const handleMouseMove = () => {
      resetTimer();
    };

    // Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(true);
        resetTimer();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleBackToEditor = useCallback(() => {
    router.push(`/projects/${projectId}`);
  }, [router, projectId]);

  const handleCopyUrl = useCallback(async () => {
    if (!previewUrl) return;
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [previewUrl]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-3 py-2",
        "bg-background/80 backdrop-blur-md border border-border rounded-full shadow-lg",
        "transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      )}
    >
      {/* Left: Back to editor */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 rounded-full"
        onClick={handleBackToEditor}
      >
        <ArrowLeftIcon className="size-4" />
        <span className="text-xs">Back to editor</span>
      </Button>

      <div className="w-px h-5 bg-border" />

      {/* Center: URL display */}
      <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full min-w-48 max-w-72">
        <div
          className={cn(
            "size-2 rounded-full shrink-0",
            previewUrl ? "bg-success" : isLoading ? "bg-ai animate-ai-pulse" : "bg-muted-foreground"
          )}
        />
        {previewUrl ? (
          <span className="text-xs text-muted-foreground font-mono truncate">
            {previewUrl}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {isLoading ? "Loading..." : "No preview"}
          </span>
        )}
        {previewUrl && (
          <button
            onClick={handleCopyUrl}
            className="p-0.5 rounded hover:bg-accent shrink-0"
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

      <div className="w-px h-5 bg-border" />

      {/* Right: Device switcher and refresh */}
      <DeviceSwitcher value={device} onChange={onDeviceChange} />

      <Button
        variant="ghost"
        size="sm"
        className="size-8 p-0 rounded-full"
        disabled={isLoading}
        onClick={onRefresh}
        title="Restart container"
      >
        <RefreshCwIcon
          className={cn("size-4", isLoading && "animate-spin")}
        />
      </Button>
    </div>
  );
};
