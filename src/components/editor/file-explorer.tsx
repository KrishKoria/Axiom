"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  FileIcon,
  FilePlus2Icon,
  FolderIcon,
  FolderPlusIcon,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Id } from "../../../convex/_generated/dataModel";
import { useProject } from "@/hooks/use-projects";

interface FileTreeItemProps {
  name: string;
  isFolder?: boolean;
  isActive?: boolean;
  depth?: number;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  onAddFile?: () => void;
  onAddFolder?: () => void;
}

function FileTreeItem({
  name,
  isFolder = false,
  isActive = false,
  depth = 0,
  defaultOpen = false,
  children,
  onClick,
  onAddFile,
  onAddFolder,
}: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
    onClick?.();
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddFile?.();
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddFolder?.();
  };

  return (
    <>
      <div
        className={cn(
          "group w-full min-w-0 flex items-center gap-1.5 px-2 py-1 text-sm overflow-hidden",
          "hover:bg-accent/50 transition-colors rounded-sm",
          isActive && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <button
          onClick={handleClick}
          className="flex w-full items-center gap-1.5 flex-1 min-w-0 text-left overflow-hidden"
        >
          {isFolder && (
            <ChevronRightIcon
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                isOpen && "rotate-90",
              )}
            />
          )}
          {isFolder ? (
            <FolderIcon className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <FileIcon className="size-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate block flex-1 min-w-0">{name}</span>
        </button>
        {isFolder && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              onClick={handleAddFile}
              className="size-5 flex items-center justify-center rounded hover:bg-accent"
              title="New File"
              variant={"highlight"}
            >
              <FilePlus2Icon className="size-3.5 text-muted-foreground" />
            </Button>
            <Button
              onClick={handleAddFolder}
              className="size-5 flex items-center justify-center rounded hover:bg-accent"
              title="New Folder"
              variant={"highlight"}
            >
              <FolderPlusIcon className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      {isFolder && isOpen && children}
    </>
  );
}

export function FileTreeSidebar({ projectId }: { projectId: Id<"projects"> }) {
  const project = useProject(projectId);
  const projectName = project?.name ?? "Loading...";
  return (
    <div className="h-full w-full border-r border-border bg-sidebar overflow-hidden flex flex-col min-w-0">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Explorer
        </span>
      </div>
      <ScrollArea className="flex-1 min-w-0 [&>[data-radix-scroll-area-viewport]]:min-w-0 [&>[data-radix-scroll-area-viewport]]:w-full [&>[data-radix-scroll-area-viewport]]:!overflow-x-hidden">
        <div className="py-1 min-w-0">
          <FileTreeItem name={projectName} isFolder defaultOpen depth={0} />
        </div>
      </ScrollArea>
    </div>
  );
}
