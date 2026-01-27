export default function FileBreadCrumbs({ fileId }: { fileId: string }) {
  return (
    <div className="px-4 py-2 border-b border-border bg-accent/50 text-sm text-muted-foreground">
      Breadcrumbs for file: {fileId}
    </div>
  );
}
