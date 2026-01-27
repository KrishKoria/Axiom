"use client";

import { XIcon } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useEditor } from "@/hooks/use-editor";
import { cn } from "@/lib/utils";
import { useFile } from "@/hooks/use-files";
import { Spinner } from "../ui/spinner";
import { FileIcon } from "@react-symbols/icons/utils";
import { Button } from "../ui/button";

interface TabProps {
  fileId: Id<"files">;
  projectId: Id<"projects">;
  isFirst: boolean;
}

export default function Tab({ fileId, projectId, isFirst }: TabProps) {
  const file = useFile(fileId);
  const { activeTabId, previewTabId, closeTab, setActiveTab, openFile } =
    useEditor(projectId);

  const isActive = fileId === activeTabId;
  const isPreview = fileId === previewTabId;

  // TODO: Track modified state when content editing is implemented
  const isModified = false;

  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "group flex items-center gap-2 pl-2 pr-1.5 h-8.75 border-y border-x border-transparent text-muted-foreground hover:bg-accent/30 py-1.5 cursor-pointer",
        isActive &&
          "text-foreground border-x-border border-b-background -mb-px drop-shadow bg-background",
        isFirst && "border-l-transparent!",
      )}
    >
      {file === undefined ? (
        <Spinner className="size-5 text-ring" />
      ) : (
        <FileIcon
          fileName={file.name}
          className="size-5 text-muted-foreground shrink-0"
        />
      )}
      <span className={cn("text-sm whitespace-nowrap", isPreview && "italic")}>
        {file?.name}
      </span>
      {isModified ? (
        <span className="size-1.5 rounded-full bg-primary shrink-0" />
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId);
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId);
          }}
          className={cn(
            "ml-1 size-4 flex items-center justify-center rounded hover:bg-accent opacity-100 hover:bg-white/ shrink-0",
            !isActive && "opacity-0 group-hover:opacity-100 transition-opacity",
          )}
        >
          <XIcon className="size-3" />
        </Button>
      )}
    </div>
  );
}
