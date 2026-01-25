import { useState } from "react";

import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";

import { getItemPadding } from "./constants";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useFolderContents,
  useRenameFile,
} from "@/hooks/use-files";
import { FileTreeItemWrapper } from "./file-tree-item-wrapper";
import { RenameInput } from "./rename-input";

export const FileTreeItem = ({
  item,
  depth = 0,
  projectId,
}: {
  item: Doc<"files">;
  depth?: number;
  projectId: Id<"projects">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const renameFile = useRenameFile({
    projectId,
    parentId: item.parentId,
  });
  const deleteFile = useDeleteFile({
    projectId,
    parentId: item.parentId,
  });
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === "folder" && isOpen,
  });

  const handleRename = (newName: string) => {
    setIsRenaming(false);

    if (newName === item.name) {
      return;
    }
    renameFile({ fileId: item._id, newName });
  };

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: item._id,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: item._id,
      });
    }
  };

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  };

  if (item.type === "file") {
    const fileName = item.name;

    return (
      <FileTreeItemWrapper
        item={item}
        depth={depth}
        isActive={isOpen}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          deleteFile({ fileId: item._id });
        }}
      >
        <FileIcon fileName={fileName} autoAssign className="size-4" />
        <span className="truncate text-sm">{fileName}</span>
      </FileTreeItemWrapper>
    );
  }

  const folderName = item.name;

  const folderRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90",
          )}
        />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="truncate text-sm">{folderName}</span>
    </>
  );

  if (creating) {
    return (
      <>
        <button
          onClick={() => setIsOpen((value) => !value)}
          className="group flex items-center gap-1 h-6 hover:bg-accent/30 w-full"
          style={{ paddingLeft: getItemPadding(depth, false) }}
        >
          {folderRender}
        </button>
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow depth={depth + 1} />}
            <CreateInput
              type={creating}
              depth={depth + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
            {folderContents?.map((subItem) => (
              <FileTreeItem
                key={subItem._id}
                item={subItem}
                depth={depth + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }

  if (isRenaming) {
    return (
      <>
        <RenameInput
          type="folder"
          defaultValue={folderName}
          isOpen={isOpen}
          depth={depth}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow depth={depth + 1} />}
            {folderContents?.map((subItem) => (
              <FileTreeItem
                key={subItem._id}
                item={subItem}
                depth={depth + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <>
      <FileTreeItemWrapper
        item={item}
        depth={depth}
        onClick={() => setIsOpen((value) => !value)}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          deleteFile({ fileId: item._id });
        }}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderRender}
      </FileTreeItemWrapper>
      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow depth={depth + 1} />}
          {folderContents?.map((subItem) => (
            <FileTreeItem
              key={subItem._id}
              item={subItem}
              depth={depth + 1}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </>
  );
};
