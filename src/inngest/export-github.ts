import ky from "ky";
import { Octokit } from "octokit";
import { NonRetriableError } from "inngest";

import { convex } from "@/lib/convex-client";
import { inngest } from "@/inngest/client";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

interface ExportToGithubEvent {
  projectId: Id<"projects">;
  repoName: string;
  visibility: "public" | "private";
  description?: string;
  githubToken: string;
}

type FileWithUrl = Doc<"files"> & {
  storageUrl: string | null;
};

export const exportToGithub = inngest.createFunction(
  {
    id: "export-to-github",
    cancelOn: [
      {
        event: "github/export.cancel",
        if: "event.data.projectId == async.data.projectId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.CONVEX_INTERNAL_KEY;
      if (!internalKey) return;

      const { projectId } = event.data.event.data as ExportToGithubEvent;

      await step.run("set-failed-status", async () => {
        await convex.mutation(api.system.updateExportStatus, {
          internalKey,
          projectId,
          status: "failed",
        });
      });
    },
  },
  {
    event: "github/export.repo",
  },
  async ({ event, step }) => {
    const { projectId, repoName, visibility, description, githubToken } =
      event.data as ExportToGithubEvent;

    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("CONVEX_INTERNAL_KEY is not configured");
    }

    await step.run("set-exporting-status", async () => {
      await convex.mutation(api.system.updateExportStatus, {
        internalKey,
        projectId,
        status: "pending",
      });
    });

    const octokit = new Octokit({ auth: githubToken });

    const { data: user } = await step.run("get-github-user", async () => {
      return await octokit.rest.users.getAuthenticated();
    });

    const { data: repo } = await step.run("create-repo", async () => {
      return await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: description || `Exported from Axiom`,
        private: visibility === "private",
        auto_init: true,
      });
    });

    await step.sleep("wait-for-repo-init", "3s");

    const initialCommitSha = await step.run("get-initial-commit", async () => {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: "heads/main",
      });
      return ref.object.sha;
    });

    const files = await step.run("fetch-project-files", async () => {
      return (await convex.query(api.system.getProjectFilesWithUrls, {
        internalKey,
        projectId,
      })) as FileWithUrl[];
    });

    // Build a map of file IDs to their full paths
    const buildFilePaths = (files: FileWithUrl[]) => {
      const fileMap = new Map<Id<"files">, FileWithUrl>();
      files.forEach((f) => fileMap.set(f._id, f));

      const getFullPath = (file: FileWithUrl): string => {
        if (!file.parentId) {
          return file.name;
        }

        const parent = fileMap.get(file.parentId);

        if (!parent) {
          return file.name;
        }

        return `${getFullPath(parent)}/${file.name}`;
      };

      const paths: Record<string, FileWithUrl> = {};
      files.forEach((file) => {
        paths[getFullPath(file)] = file;
      });

      return paths;
    };

    const filePaths = buildFilePaths(files);

    // Filter to only actual files (not folders)
    const fileEntries = Object.entries(filePaths).filter(
      ([, file]) => file.type === "file",
    );

    if (fileEntries.length === 0) {
      throw new NonRetriableError("No files to export");
    }

    const treeItems = await step.run("create-blobs", async () => {
      // Helper to chunk array for batched processing
      const chunk = <T>(arr: T[], size: number): T[][] =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, (i + 1) * size),
        );

      const BATCH_SIZE = 5;
      const batches = chunk(fileEntries, BATCH_SIZE);
      const allItems: {
        path: string;
        mode: "100644";
        type: "blob";
        sha: string;
      }[] = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async ([path, file]) => {
            let content: string;
            let encoding: "utf-8" | "base64" = "utf-8";

            if (file.content !== undefined) {
              // Text file
              content = file.content;
            } else if (file.storageUrl) {
              // Binary file - fetch and base64 encode
              const response = await ky.get(file.storageUrl);
              const buffer = Buffer.from(await response.arrayBuffer());
              content = buffer.toString("base64");
              encoding = "base64";
            } else {
              // Skip files with no content
              return null;
            }

            const { data: blob } = await octokit.rest.git.createBlob({
              owner: user.login,
              repo: repoName,
              content,
              encoding,
            });

            return {
              path,
              mode: "100644" as const,
              type: "blob" as const,
              sha: blob.sha,
            };
          }),
        );

        allItems.push(
          ...batchResults.filter(
            (item): item is NonNullable<typeof item> => item !== null,
          ),
        );
      }

      return allItems;
    });

    if (treeItems.length === 0) {
      throw new NonRetriableError("Failed to create any file blobs");
    }

    const { data: tree } = await step.run("create-tree", async () => {
      return await octokit.rest.git.createTree({
        owner: user.login,
        repo: repoName,
        tree: treeItems,
      });
    });

    const { data: commit } = await step.run("create-commit", async () => {
      return await octokit.rest.git.createCommit({
        owner: user.login,
        repo: repoName,
        message: "Initial commit from Axiom",
        tree: tree.sha,
        parents: [initialCommitSha],
      });
    });

    await step.run("update-branch-ref", async () => {
      return await octokit.rest.git.updateRef({
        owner: user.login,
        repo: repoName,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    });

    await step.run("set-completed-status", async () => {
      await convex.mutation(api.system.updateExportStatus, {
        internalKey,
        projectId,
        status: "completed",
        repoUrl: repo.html_url,
      });
    });

    return {
      success: true,
      repoUrl: repo.html_url,
      filesExported: treeItems.length,
    };
  },
);
