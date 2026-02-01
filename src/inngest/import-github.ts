import { convex } from "@/lib/convex-client";
import { Id } from "../../convex/_generated/dataModel";
import { inngest } from "./client";
import { api } from "../../convex/_generated/api";
import { NonRetriableError } from "inngest";
import { Octokit } from "octokit";
import { isBinaryFile } from "isbinaryfile";
import ky from "ky";

interface ImportGithubRepoEvent {
  owner: string;
  repo: string;
  projectId: Id<"projects">;
  githubToken: string;
}

export const importGithubRepo = inngest.createFunction(
  {
    id: "import-github-repo",
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.CONVEX_INTERNAL_KEY;
      if (!internalKey) return;

      const { projectId } = event.data.event.data as ImportGithubRepoEvent;

      await step.run("set-failed-status", async () => {
        await convex.mutation(api.system.updateImportStatus, {
          internalKey,
          projectId,
          status: "failed",
        });
      });
    },
  },
  {
    event: "github/import.repo",
  },
  async ({ event, step }) => {
    const { owner, repo, projectId, githubToken } =
      event.data as ImportGithubRepoEvent;
    const internalKey = process.env.CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError("Missing CONVEX_INTERNAL_KEY");
    }

    const octokit = new Octokit({ auth: githubToken });

    await step.run("cleanup-project", async () => {
      await convex.mutation(api.system.cleanup, {
        internalKey,
        projectId,
      });
    });

    const tree = await step.run("fetch-repo-tree", async () => {
      try {
        const { data } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: "main",
          recursive: "1",
        });

        return data;
      } catch {
        const { data } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: "master",
          recursive: "1",
        });

        return data;
      }
    });

    const folders = tree.tree
      .filter((item) => item.type === "tree" && item.path)
      .sort((a, b) => {
        const aDepth = a.path ? a.path.split("/").length : 0;
        const bDepth = b.path ? b.path.split("/").length : 0;

        return aDepth - bDepth;
      });

    const folderIdMap = await step.run("create-folders", async () => {
      const map: Record<string, Id<"files">> = {};

      for (const folder of folders) {
        if (!folder.path) {
          continue;
        }

        const pathParts = folder.path.split("/");
        const name = pathParts.pop()!;
        const parentPath = pathParts.join("/");
        const parentId = parentPath ? map[parentPath] : undefined;

        const folderId = await convex.mutation(api.system.createFolder, {
          internalKey,
          projectId,
          name,
          parentId,
        });

        map[folder.path] = folderId;
      }

      return map;
    });

    const allFiles = tree.tree.filter(
      (item) => item.type === "blob" && item.path && item.sha,
    );

    // Helper function to split array into chunks
    function chunkArray<T>(array: T[], chunkSize: number): T[][] {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }

    await step.run("import-files", async () => {
      const CHUNK_SIZE = 10; // Process 10 files in parallel at a time
      const chunks = chunkArray(allFiles, CHUNK_SIZE);

      for (const chunk of chunks) {
        // Fetch all blobs in this chunk in parallel
        const blobResults = await Promise.allSettled(
          chunk.map(async (file) => {
            if (!file.path || !file.sha) {
              throw new Error("Missing path or sha");
            }
            const { data: blob } = await octokit.rest.git.getBlob({
              owner,
              repo,
              file_sha: file.sha,
            });
            return { file, blob };
          }),
        );

        // Separate text and binary files
        const textFiles: Array<{
          name: string;
          content: string;
          parentId?: Id<"files">;
        }> = [];
        const binaryFiles: Array<{
          file: (typeof allFiles)[number];
          buffer: Buffer;
          name: string;
          parentId?: Id<"files">;
        }> = [];

        for (const result of blobResults) {
          if (result.status === "rejected") {
            console.error("Failed to fetch blob:", result.reason);
            continue;
          }

          const { file, blob } = result.value;
          if (!file.path) continue;

          try {
            const buffer = Buffer.from(blob.content, "base64");
            const isBinary = await isBinaryFile(buffer);
            const pathParts = file.path.split("/");
            const name = pathParts.pop()!;
            const parentPath = pathParts.join("/");
            const parentId = parentPath ? folderIdMap[parentPath] : undefined;

            if (isBinary) {
              binaryFiles.push({ file, buffer, name, parentId });
            } else {
              const content = buffer.toString("utf-8");
              textFiles.push({ name, content, parentId });
            }
          } catch (error) {
            console.error(`Failed to process file ${file.path}:`, error);
          }
        }

        // Batch create text files using createFiles mutation
        if (textFiles.length > 0) {
          // Group text files by parentId for batch insertion
          const filesByParent = textFiles.reduce(
            (acc, file) => {
              const key = file.parentId ?? "root";
              if (!acc[key]) acc[key] = [];
              acc[key].push({ name: file.name, content: file.content });
              return acc;
            },
            {} as Record<string, Array<{ name: string; content: string }>>,
          );

          // Create all text files in parallel batches by parent
          await Promise.allSettled(
            Object.entries(filesByParent).map(([parentKey, files]) =>
              convex.mutation(api.system.createFiles, {
                internalKey,
                projectId,
                parentId:
                  parentKey === "root" ? undefined : (parentKey as Id<"files">),
                files,
              }),
            ),
          );
        }

        // Process binary files sequentially (they need upload URLs)
        for (const { buffer, name, parentId } of binaryFiles) {
          try {
            const uploadUrl = await convex.mutation(
              api.system.generateUploadUrl,
              { internalKey },
            );
            const { storageId } = await ky
              .post(uploadUrl, {
                headers: { "Content-Type": "application/octet-stream" },
                body: new Uint8Array(buffer),
              })
              .json<{ storageId: Id<"_storage"> }>();

            await convex.mutation(api.system.createBinaryFile, {
              internalKey,
              projectId,
              name,
              storageId,
              parentId,
            });
          } catch (error) {
            console.error(`Failed to upload binary file ${name}:`, error);
          }
        }
      }
    });

    await step.run("set-imported-status", async () => {
      await convex.mutation(api.system.updateImportStatus, {
        internalKey,
        projectId,
        status: "completed",
      });
    });
    return { success: true, projectId };
  },
);
