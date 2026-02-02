import { PreviewFullscreen } from "@/components/preview/preview-fullscreen";
import { Id } from "../../../../convex/_generated/dataModel";

type PreviewPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { projectId } = await params;
  return <PreviewFullscreen projectId={projectId as Id<"projects">} />;
}
