// import { PlusIcon } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useEditor } from "@/hooks/use-editor";
import Tab from "./tab";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export default function EditorTabs({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const { openTabs } = useEditor(projectId);

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <ScrollArea>
      <div className="flex items-center gap-0 border-b border-border bg-muted/30 overflow-x-auto">
        {openTabs.map((fileId, index) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            projectId={projectId}
          />
        ))}
        {/* TODO: Add the functionality to add a new file */}
        {/* <button className="ml-1 px-2 py-1.5 hover:bg-accent/50 transition-colors">
          <PlusIcon className="size-4 text-muted-foreground" />
        </button> */}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
