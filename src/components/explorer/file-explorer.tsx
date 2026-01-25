"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, FilePlus2Icon, FolderPlusIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Id } from "../../../convex/_generated/dataModel";
import { useProject } from "@/hooks/use-projects";
import { useCreateFile, useCreateFolder } from "@/hooks/use-files";
import { CreateInput } from "./create-input";

export function FileTreeSidebar({ projectId }: { projectId: Id<"projects"> }) {
  return (
    <div className="h-full w-full border-r border-border bg-sidebar overflow-hidden flex flex-col min-w-0">
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Explorer
        </span>
      </div>
      <ScrollArea className="flex-1 min-w-0 *:data-radix-scroll-area-viewport:min-w-0 *:data-radix-scroll-area-viewport:w-full *:data-radix-scroll-area-viewport:overflow-x-hidden!">
        <div className="py-1 min-w-0">
          <FileTree projectId={projectId} />
        </div>
      </ScrollArea>
    </div>
  );
}

function FileTree({ projectId }: { projectId: Id<"projects"> }) {
  const [isOpen, setIsOpen] = useState(true);
  const project = useProject(projectId);
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const handleCreate = (name: string) => {
    setCreating(null);
    if (creating === "file") {
      void createFile({
        projectId,
        parentId: undefined,
        name,
        content: "",
      });
    } else if (creating === "folder") {
      void createFolder({
        projectId,
        parentId: undefined,
        name,
      });
    }
  };
  return (
    <>
      <div
        className={cn(
          "group w-full min-w-0 flex items-center gap-1.5 px-2 py-1 text-sm overflow-hidden",
          "hover:bg-accent/50 transition-colors rounded-sm",
        )}
        onClick={() => setIsOpen((state) => !state)}
      >
        <button className="flex w-full items-center gap-1.5 flex-1 min-w-0 text-left overflow-hidden">
          <ChevronRightIcon
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
              isOpen && "rotate-90",
            )}
          />
          <span className="truncate block flex-1 min-w-0">
            {project?.name ?? "Loading..."}
          </span>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(true);
              setCreating("file");
            }}
            className="size-5 flex items-center justify-center rounded hover:bg-accent"
            title="New File"
            variant={"highlight"}
          >
            <FilePlus2Icon className="size-3.5 text-muted-foreground" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(true);
              setCreating("folder");
            }}
            className="size-5 flex items-center justify-center rounded hover:bg-accent"
            title="New Folder"
            variant={"highlight"}
          >
            <FolderPlusIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      {isOpen && (
        <>
          {creating && (
            <CreateInput
              type={creating}
              depth={0}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
          )}
        </>
      )}
    </>
  );
}
