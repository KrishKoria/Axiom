"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Globe, Github, Sparkles, ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useCallback } from "react";

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

function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <div className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md bg-secondary/80 text-secondary-foreground text-xs font-medium font-mono"
        >
          {key === "cmd" ? <Command className="size-3.5" /> : key}
        </kbd>
      ))}
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  shortcut,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  shortcut: string[];
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start gap-5 p-5 rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/50 hover:bg-card/80",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "w-56",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <Icon className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        <KeyboardShortcut keys={shortcut} />
      </div>
      <span className="text-base font-medium">{title}</span>
    </button>
  );
}

function FeaturedProject({
  name,
  updatedAt,
  isGithub,
  onClick,
}: {
  name: string;
  updatedAt: number;
  isGithub?: boolean;
  onClick?: () => void;
}) {
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between w-full p-5 rounded-xl",
        "bg-card border border-border",
        "hover:border-primary/50 hover:bg-card/80",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="flex items-center gap-4">
        {isGithub ? (
          <Github className="size-5 text-muted-foreground" />
        ) : (
          <Globe className="size-5 text-muted-foreground" />
        )}
        <div className="flex flex-col items-start gap-1">
          <span className="text-base font-medium">{name}</span>
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
      <ArrowRight className="size-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

function ProjectRow({
  name,
  updatedAt,
  isGithub,
  onClick,
}: {
  name: string;
  updatedAt: number;
  isGithub?: boolean;
  onClick?: () => void;
}) {
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between w-full py-3 px-4 -mx-4 rounded-lg",
        "hover:bg-accent/50",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-center gap-4">
        {isGithub ? (
          <Github className="size-5 text-muted-foreground" />
        ) : (
          <Globe className="size-5 text-muted-foreground" />
        )}
        <span className="text-base text-foreground/90">{name}</span>
      </div>
      <span className="text-sm text-muted-foreground tabular-nums font-mono">
        {timeAgo}
      </span>
    </button>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function ProjectView() {
  const projects = useQuery(api.projects.get);

  // Sort projects by updatedAt (most recent first)
  const sortedProjects = projects
    ? [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
    : [];

  const featuredProject = sortedProjects[0];
  const recentProjects = sortedProjects.slice(1, 6);

  // Keyboard shortcut handlers
  const handleNew = useCallback(() => {
    console.log("New project");
    // TODO: Implement new project action
  }, []);

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
            <FeaturedProject
              name={featuredProject.name}
              updatedAt={featuredProject.updatedAt}
              isGithub={!!featuredProject.exportRepoURL}
            />
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
                <ProjectRow
                  key={project._id}
                  name={project.name}
                  updatedAt={project.updatedAt}
                  isGithub={!!project.exportRepoURL}
                />
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
              Loading projects...
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
