import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

import { getItemPadding } from "./constants";
import { Doc } from "../../../convex/_generated/dataModel";

export const FileTreeItemWrapper = ({
  item,
  children,
  depth,
  isActive,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
}: {
  item: Doc<"files">;
  children: React.ReactNode;
  depth: number;
  isActive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
          className={cn(
            "group flex items-center gap-1 w-full h-6 hover:bg-accent/40 outline-none transition-colors duration-150",
            "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-accent/20",
            isActive && "bg-accent/30 border-l-2 border-primary",
          )}
          style={{ paddingLeft: getItemPadding(depth, item.type === "file") }}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-64"
      >
        {item.type === "folder" && (
          <>
            <ContextMenuItem onClick={onCreateFile} className="text-sm">
              New File...
            </ContextMenuItem>
            <ContextMenuItem onClick={onCreateFolder} className="text-sm">
              New Folder...
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={onRename} className="text-sm">
          Rename...
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-sm">
          Delete Permanently
          <ContextMenuShortcut>⌘Backspace</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
