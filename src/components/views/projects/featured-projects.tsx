import { cn, getTimeAgo } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { getProjectIcon } from "./project-view";
import Link from "next/link";

export default function FeaturedProject({
  project,
}: {
  project: Doc<"projects">;
}) {
  const timeAgo = getTimeAgo(project.updatedAt);
  return (
    <Link
      href={`/projects/${project._id}`}
      className={cn(
        "group flex items-center justify-between w-full p-5 rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/50 hover:bg-card/80",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="flex items-center gap-4">
        {getProjectIcon(project)}
        <div className="flex flex-col items-start gap-1">
          <span className="text-base font-medium">{project.name}</span>
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
      <ArrowRight className="size-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
