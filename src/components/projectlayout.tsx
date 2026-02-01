"use client";

import { Allotment } from "allotment";

import { Id } from "../../convex/_generated/dataModel";
import { Navbar } from "./navbar";
import { ConversationPanel } from "./conversation-panel/conversation-panel";
import { CodePanel } from "./editor/code-panel";
import { cn } from "@/lib/utils";

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 300;
const DEFAULT_MAIN_SIZE = 1000;

export const ProjectLayout = ({
  projectId,
}: {
  children: React.ReactNode;
  projectId: Id<"projects">;
}) => {
  return (
    <div className={cn("w-full h-screen flex flex-col")}>
      <Navbar projectId={projectId} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment
          className="flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationPanel projectId={projectId} />
          </Allotment.Pane>
          <Allotment.Pane>
            <CodePanel projectId={projectId} />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};
