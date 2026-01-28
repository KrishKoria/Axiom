import { useEditor } from "@/hooks/use-editor";
import { Id } from "../../../convex/_generated/dataModel";
import { useFilePath } from "@/hooks/use-files";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { FileIcon } from "@react-symbols/icons/utils";

export const FileBreadCrumbs = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  if (filePath === undefined || !activeTabId) {
    return (
      <div className="px-3 py-2 bg-background border-b border-border">
        <div className="h-5" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2 bg-background border-b border-border">
      <Breadcrumb>
        <BreadcrumbList>
          {filePath.map((item, index) => {
            const isLast = index === filePath.length - 1;

            return (
              <React.Fragment key={item._id}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <FileIcon
                        fileName={item.name}
                        autoAssign
                        className="size-3.5"
                      />
                      {item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <span className="flex items-center gap-1 cursor-default">
                        {item.name}
                      </span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
