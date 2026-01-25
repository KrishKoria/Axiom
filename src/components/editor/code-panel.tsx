"use client";

import { useState } from "react";
import { Allotment } from "allotment";
import {
  FileIcon,
  PlusIcon,
  TerminalIcon,
  CodeIcon,
  PlayIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  SmartphoneIcon,
  TabletIcon,
  MonitorIcon,
  GithubIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileTreeSidebar } from "../explorer/file-explorer";
import { Id } from "../../../convex/_generated/dataModel";

const MIN_FILE_TREE_WIDTH = 160;
const MAX_FILE_TREE_WIDTH = 400;
const DEFAULT_FILE_TREE_WIDTH = 224;

interface CodePanelProps {
  projectId: Id<"projects">;
}

type PanelTab = "code" | "preview";
type PreviewDevice = "desktop" | "tablet" | "mobile";

function EditorTabs() {
  return (
    <div className="flex items-center gap-0 border-b border-border bg-muted/30 overflow-x-auto">
      <div className="flex items-center gap-1 px-3 py-1.5 border-r border-border bg-background text-sm">
        <FileIcon className="size-3.5 text-muted-foreground" />
        <span>index.tsx</span>
        <button className="ml-1 size-4 flex items-center justify-center rounded hover:bg-accent">
          <span className="text-xs text-muted-foreground">×</span>
        </button>
      </div>
      <div className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 transition-colors">
        <FileIcon className="size-3.5" />
        <span>styles.css</span>
      </div>
      <button className="ml-1 px-2 py-1.5 hover:bg-accent/50 transition-colors">
        <PlusIcon className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function CodeEditor() {
  const lines = [
    { num: 1, content: 'import { useState } from "react";', indent: 0 },
    { num: 2, content: "", indent: 0 },
    { num: 3, content: "export default function App() {", indent: 0 },
    { num: 4, content: "  const [count, setCount] = useState(0);", indent: 0 },
    { num: 5, content: "", indent: 0 },
    { num: 6, content: "  return (", indent: 0 },
    { num: 7, content: '    <div className="app">', indent: 0 },
    { num: 8, content: "      <h1>Hello, Axiom!</h1>", indent: 0 },
    { num: 9, content: "      <p>Count: {count}</p>", indent: 0 },
    {
      num: 10,
      content: "      <button onClick={() => setCount(c => c + 1)}>",
      indent: 0,
    },
    { num: 11, content: "        Increment", indent: 0 },
    { num: 12, content: "      </button>", indent: 0 },
    { num: 13, content: "    </div>", indent: 0 },
    { num: 14, content: "  );", indent: 0 },
    { num: 15, content: "}", indent: 0 },
  ];

  return (
    <div className="flex-1 overflow-auto font-mono text-sm bg-background">
      <div className="min-w-max">
        {lines.map((line) => (
          <div
            key={line.num}
            className="flex hover:bg-muted/30 transition-colors"
          >
            <span className="w-12 px-3 text-right text-muted-foreground select-none border-r border-border">
              {line.num}
            </span>
            <pre className="flex-1 px-4 whitespace-pre">
              <code>{line.content || " "}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="h-48 border-t border-border bg-card flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
        <TerminalIcon className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Terminal
        </span>
      </div>
      <div className="flex-1 p-3 font-mono text-xs overflow-auto">
        <div className="text-muted-foreground">$ npm run dev</div>
        <div className="text-foreground mt-1">
          <span className="text-success">▸</span> Ready on http://localhost:3000
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-1">
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}

function CodeTabContent({ projectId }: { projectId: Id<"projects"> }) {
  return (
    <Allotment className="h-full">
      <Allotment.Pane
        minSize={MIN_FILE_TREE_WIDTH}
        maxSize={MAX_FILE_TREE_WIDTH}
        preferredSize={DEFAULT_FILE_TREE_WIDTH}
        className="min-w-0"
      >
        <div className="h-full min-w-0">
          <FileTreeSidebar projectId={projectId} />
        </div>
      </Allotment.Pane>
      <Allotment.Pane>
        <div className="h-full flex flex-col min-w-0">
          <EditorTabs />
          <CodeEditor />
          <TerminalPanel />
        </div>
      </Allotment.Pane>
    </Allotment>
  );
}

function PreviewTabContent() {
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
            "bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300",
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Hello, Axiom!
            </h1>
            <p className="text-gray-600 mb-4">Count: 0</p>
            <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
              Increment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}) {
  return (
    <div className="shrink-0 flex items-center border-b border-border bg-sidebar">
      <div className="flex items-center gap-0">
        <Button
          variant={"ghost"}
          onClick={() => onTabChange("code")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px rounded-none",
            activeTab === "code"
              ? "border-primary text-foreground bg-background"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
          )}
        >
          <CodeIcon className="size-4" />
          Code
        </Button>
        <Button
          onClick={() => onTabChange("preview")}
          variant={"ghost"}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px rounded-none",
            activeTab === "preview"
              ? "border-ai text-foreground bg-background"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
          )}
        >
          <PlayIcon className="size-4" />
          Preview
        </Button>
      </div>
      <div className="flex-1" />
      <div className="px-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-xs"
        >
          <GithubIcon className="size-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}

export function CodePanel({ projectId }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("code");

  return (
    <div className="flex flex-col h-full bg-background">
      <PanelTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-0">
        {activeTab === "code" ? (
          <CodeTabContent projectId={projectId} />
        ) : (
          <PreviewTabContent />
        )}
      </div>
    </div>
  );
}
