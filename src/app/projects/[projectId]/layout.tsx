import { ProjectLayout } from "@/components/projectlayout";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function ProjectPageLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: Id<"projects"> }>;
}>) {
  const { projectId } = await params;
  return <ProjectLayout projectId={projectId}>{children}</ProjectLayout>;
}
