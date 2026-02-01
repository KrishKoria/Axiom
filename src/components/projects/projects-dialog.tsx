import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useProjects } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";
import { getProjectIcon } from "./project-view";

interface ProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectsDialog({
  open,
  onOpenChange,
}: ProjectsDialogProps) {
  const router = useRouter();
  const projects = useProjects();
  const handleSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    onOpenChange(false);
  };
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search and Navigate to your projects"
    >
      <CommandInput placeholder="Type a project name..." />
      <CommandList>
        <CommandEmpty>No projects found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name}-${project._id}`}
              onSelect={() => handleSelect(project._id)}
            >
              {getProjectIcon(project)}
              <span className="ml-2">{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
