import { cn } from "@/lib/utils";
import {
  ExternalLinkIcon,
  MonitorIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

type PreviewDevice = "desktop" | "tablet" | "mobile";

export default function PreviewTabContent() {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const deviceWidths: Record<PreviewDevice, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Preview Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {/* URL Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md min-w-64">
            <div className="size-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground font-mono">
              localhost:3000
            </span>
          </div>
          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={handleRefresh}
          >
            <RefreshCwIcon
              className={cn("size-4", isLoading && "animate-spin")}
            />
          </Button>
          {/* Open External */}
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              device === "desktop"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MonitorIcon className="size-4" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              device === "tablet"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TabletIcon className="size-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              device === "mobile"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <SmartphoneIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 flex items-start justify-center p-4 bg-muted/20 overflow-auto">
        <div
          className={cn(
            "bg-card rounded-lg shadow-lg overflow-hidden transition-all duration-300",
            device !== "desktop" && "border border-border",
          )}
          style={{
            width: deviceWidths[device],
            height: device === "desktop" ? "100%" : "auto",
            minHeight: device !== "desktop" ? "600px" : undefined,
            maxWidth: "100%",
          }}
        >
          {/* Mock Preview Content */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Hello, Axiom!
            </h1>
            <p className="text-muted-foreground mb-4">Count: 0</p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Increment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
