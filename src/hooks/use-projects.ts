import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useProjects() {
  return useQuery(api.projects.get);
}

export function useProjectsPartial(limit: number) {
  return useQuery(api.projects.getPartial, { limit });
}

export function useProject(projectId: Id<"projects">) {
  return useQuery(api.projects.getById, { id: projectId });
}

export function useCreateProject() {
  return useMutation(api.projects.create).withOptimisticUpdate(
    (localStore, args) => {
      const existingProjects = localStore.getQuery(api.projects.get);
      const existingPartialProjects = localStore.getQuery(
        api.projects.getPartial,
        { limit: 6 },
      );
      if (existingProjects !== undefined) {
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const newProject = {
          _id: crypto.randomUUID() as Id<"projects">,
          _creationTime: now,
          name: args.name,
          ownerId: "anonymous",
          updatedAt: now,
        };
        localStore.setQuery(api.projects.get, {}, [
          newProject,
          ...existingProjects,
        ]);
        if (existingPartialProjects !== undefined) {
          const nextPartial = [newProject, ...existingPartialProjects]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 6);
          localStore.setQuery(
            api.projects.getPartial,
            { limit: 6 },
            nextPartial,
          );
        }
      }
    },
  );
}

export const useRenameProject = () => {
  return useMutation(api.projects.rename).withOptimisticUpdate(
    (localStore, args) => {
      const existingProject = localStore.getQuery(api.projects.getById, {
        id: args.id,
      });

      if (existingProject !== undefined && existingProject !== null) {
        localStore.setQuery(
          api.projects.getById,
          { id: args.id },
          {
            ...existingProject,
            name: args.name,
            // eslint-disable-next-line react-hooks/purity
            updatedAt: Date.now(),
          },
        );
      }

      const existingProjects = localStore.getQuery(api.projects.get);

      if (existingProjects !== undefined) {
        localStore.setQuery(
          api.projects.get,
          {},
          existingProjects.map((project) => {
            return project._id === args.id
              ? { ...project, name: args.name, updatedAt: Date.now() }
              : project;
          }),
        );
      }
    },
  );
};
