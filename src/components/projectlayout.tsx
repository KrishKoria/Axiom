"use client";

import { useState } from "react";
import { Allotment } from "allotment";

import "allotment/dist/style.css";
import { Id } from "../../convex/_generated/dataModel";
import { Navbar } from "./navbar";
import { ConversationPanel } from "./editor/conversation-panel";
import { CodePanel } from "./editor/code-panel";
import { useProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_SIZE = 1000;

export const ProjectLayout = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: Id<"projects">;
}) => {
  const project = useProject(projectId);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (message: string) => {
    // Simulate AI thinking
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
    }, 2000);
  };

  return (
    <div className={cn("w-full h-screen flex flex-col", isThinking && "gutter-thinking")}>
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
            <ConversationPanel isThinking={isThinking} onSend={handleSend} />
          </Allotment.Pane>
          <Allotment.Pane>
            <CodePanel projectName={project?.name} />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};
