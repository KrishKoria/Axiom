"use client";

import { useEffect, useRef, useState } from "react";
import { Allotment } from "allotment";
import { CodeIcon, PlayIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileTreeSidebar } from "../explorer/file-explorer";
import { Id } from "../../../convex/_generated/dataModel";
import PreviewTabContent from "../preview/preview-tab";
import EditorTabs from "./editor-tabs";
import { useEditor } from "@/hooks/use-editor";
import { FileBreadCrumbs } from "./file-bread-crumbs";
import { useFile, useUpdateFileContent, useFileUrl } from "@/hooks/use-files";
import CodeEditor from "./code-editor";
import { BinaryFilePreview } from "./binary-file-preview";
import { ExportPopover } from "../projects/export-to-github";

const MIN_FILE_TREE_WIDTH = 160;
const MAX_FILE_TREE_WIDTH = 400;
const DEFAULT_FILE_TREE_WIDTH = 224;

interface CodePanelProps {
  projectId: Id<"projects">;
}

type PanelTab = "code" | "preview";

function CodeTabContent({ projectId }: { projectId: Id<"projects"> }) {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);
  const updateFileContent = useUpdateFileContent();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileUrl = useFileUrl(activeFile?.storageId);
  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);
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
          ) : isActiveFileBinary && activeFile ? (
            <BinaryFilePreview filename={activeFile.name} url={fileUrl} />
          ) : (
            <div className="flex items-center justify-center size-full">
              <div className="flex flex-col items-center gap-6 max-w-sm px-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ai-pulse rounded-full" />
                  <SparklesIcon className="size-12 text-ai relative z-10" />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No file open
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Select a file from the explorer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Allotment.Pane>
    </Allotment>
  );
}

function PanelTabs({
  activeTab,
  onTabChange,
  projectId,
}: {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  projectId: Id<"projects">;
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
      <ExportPopover projectId={projectId} />
    </div>
  );
}

export function CodePanel({ projectId }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("code");

  return (
    <div className="flex flex-col h-full bg-background">
      <PanelTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectId={projectId}
      />
      <div className="flex-1 min-h-0">
        {activeTab === "code" ? (
          <CodeTabContent projectId={projectId} />
        ) : (
          <PreviewTabContent projectId={projectId} />
        )}
      </div>
    </div>
  );
}
