"use client";

import { useRef, useState } from "react";
import { Allotment } from "allotment";
import { TerminalIcon, CodeIcon, PlayIcon, GithubIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileTreeSidebar } from "../explorer/file-explorer";
import { Id } from "../../../convex/_generated/dataModel";
import PreviewTabContent from "./preview-tab";
import EditorTabs from "./editor-tabs";
import { useEditor } from "@/hooks/use-editor";
import { FileBreadCrumbs } from "./file-bread-crumbs";
import { useFile, useUpdateFileContent, useFileUrl } from "@/hooks/use-files";
import Image from "next/image";
import CodeEditor from "./code-editor";
import { BinaryFilePreview } from "./binary-file-preview";

const MIN_FILE_TREE_WIDTH = 160;
const MAX_FILE_TREE_WIDTH = 400;
const DEFAULT_FILE_TREE_WIDTH = 224;

interface CodePanelProps {
  projectId: Id<"projects">;
}

type PanelTab = "code" | "preview";

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
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);
  const updateFileContent = useUpdateFileContent();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileUrl = useFileUrl(activeFile?.storageId);
  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;
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
          <EditorTabs projectId={projectId} />
          {activeTabId && <FileBreadCrumbs projectId={projectId} />}
          {isActiveFileText ? (
            <CodeEditor
              key={activeFile._id}
              initialValue={activeFile.content}
              filename={activeFile.name}
              onChange={(value: string) => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                  updateFileContent({
                    fileId: activeFile._id,
                    content: value,
                  });
                }, 500);
              }}
            />
          ) : (
            <div className="flex items-center justify-center size-full">
              <Image
                src="/logo.svg"
                alt="No file selected"
                width={250}
                height={250}
                className="opacity-25 grayscale"
              />
            </div>
          )}
          {isActiveFileBinary && activeFile && (
            <BinaryFilePreview
              filename={activeFile.name}
              url={fileUrl}
            />
          )}
          {/* <TerminalPanel /> */}
        </div>
      </Allotment.Pane>
    </Allotment>
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
