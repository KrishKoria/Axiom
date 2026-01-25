import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

import { getItemPadding } from "./constants";

export const LoadingRow = ({
  className,
  depth = 0,
}: {
  className?: string;
  depth?: number;
}) => {
  return (
    <div
      className={cn(
        "h-6 flex items-center text-muted-foreground",
        "animate-pulse",
        className
      )}
      style={{ paddingLeft: getItemPadding(depth, true) }}
    >
      <Spinner className="size-4 text-muted-foreground ml-0.5" />
    </div>
  );
};
