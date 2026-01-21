"use client";

import {
  Github,
  Sparkles,
  AlertCircleIcon,
  Loader2Icon,
  GlobeIcon,
} from "lucide-react";
import { cn, generateName, getTimeAgo } from "@/lib/utils";
import { useEffect, useCallback } from "react";
import FeaturedProject from "./featured-projects";
import { Button } from "@/components/ui/button";
import { ActionCard, KeyboardShortcut } from "./action-card";
import { useCreateProject, useProjectsPartial } from "@/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Doc } from "../../../../convex/_generated/dataModel";

export function getProjectIcon(project: Doc<"projects">) {
  if (project.importStatus === "completed") {
    return <Github className="size-5 text-muted-foreground" />;
  }
  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-5 text-red-500" />;
  }
  if (project.importStatus === "pending") {
    return (
      <Loader2Icon className="size-5 text-muted-foreground animate-spin" />
    );
  }
  return <GlobeIcon className="size-5 text-muted-foreground" />;
}

function AxiomLogo() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="relative size-14 flex items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
        {/* Logo mark - abstract A shape */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="relative size-12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="6"
            className="fill-primary"
          />
          <path
            d="M10 22L16 10L22 22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground"
          />
          <path
            d="M12 18H20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-primary-foreground"
          />
        </svg>
      </div>
      <span className="text-4xl font-semibold tracking-tight">Axiom</span>
    </div>
  );
}

function ProjectRow({ project }: { project: Doc<"projects"> }) {
  const timeAgo = getTimeAgo(project.updatedAt);

  return (
    <Button
      variant="ghost"
      className={cn(
        "group flex items-center justify-between w-full h-auto py-3 px-4 rounded-lg",
        "hover:bg-accent/50",
        "transition-colors duration-150",
      )}
      asChild
    >
      <Link
        href={`/projects/${project._id}`}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-4">
          {getProjectIcon(project)}
          <span className="text-base text-foreground/90">{project.name}</span>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums font-mono">
          {timeAgo}
        </span>
      </Link>
    </Button>
  );
}

export default function ProjectView() {
  const projects = useProjectsPartial(6);
  const createProject = useCreateProject();
  // Sort projects by updatedAt (most recent first)
  const sortedProjects = projects
    ? [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
    : [];

  const featuredProject = sortedProjects[0];
  const recentProjects = sortedProjects.slice(1, 6);

  // Keyboard shortcut handlers
  const handleNew = useCallback(() => {
    createProject({
      name: generateName(),
    });
  }, [createProject]);

  const handleImport = useCallback(() => {
    console.log("Import project");
    // TODO: Implement import action
  }, []);

  const handleViewAll = useCallback(() => {
    console.log("View all projects");
    // TODO: Implement view all action
  }, []);

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const modifier = e.metaKey || e.ctrlKey;

      if (modifier && e.key.toLowerCase() === "j") {
        e.preventDefault();
        handleNew();
      } else if (modifier && e.key.toLowerCase() === "i") {
        e.preventDefault();
        handleImport();
      } else if (modifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleViewAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNew, handleImport, handleViewAll]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-10">
        {/* Logo - centered */}
        <div className="flex justify-center">
          <AxiomLogo />
        </div>

        {/* Action Cards - centered */}
        <div className="flex justify-center gap-4">
          <ActionCard
            icon={Sparkles}
            title="New"
            shortcut={["cmd", "J"]}
            onClick={handleNew}
          />
          <ActionCard
            icon={Github}
            title="Import"
            shortcut={["cmd", "I"]}
            onClick={handleImport}
          />
        </div>

        {/* Last Updated */}
        {featuredProject && (
          <div className="space-y-4">
            <h2 className="text-base text-muted-foreground">Last updated</h2>
            <FeaturedProject project={featuredProject} />
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-muted-foreground">
                Recent projects
              </h2>
              <button
                onClick={handleViewAll}
                className="flex items-center gap-2.5 text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>View all</span>
                <KeyboardShortcut keys={["cmd", "K"]} />
              </button>
            </div>
            <div className="flex flex-col">
              {recentProjects.map((project) => (
                <ProjectRow key={project._id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!projects && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center mb-5">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
            <p className="text-base text-muted-foreground">
              <Spinner className="size-4 text-ring" />
            </p>
          </div>
        )}

        {projects && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center mb-5">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-base text-muted-foreground">
              Create a new project or import from GitHub to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
