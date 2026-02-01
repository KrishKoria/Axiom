import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processMessage } from "@/inngest/process-messages";
import { importGithubRepo } from "@/inngest/import-github";
import { exportToGithub } from "@/inngest/export-github";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMessage, importGithubRepo, exportToGithub],
});
