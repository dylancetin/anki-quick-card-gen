import { lazy, Suspense } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Markdown = lazy(
  /* webpackPreload: true */ () => import("@/components/markdown"),
);

export function RenderMdWithTooltip({
  content,
  onDoubleClick,
  doTruncate = true,
}: {
  content: string;
  onDoubleClick?: () => void;
  doTruncate?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`${doTruncate ? "truncate **:truncate" : "text-wrap"} max-w-96 cursor-pointer`}
          onDoubleClick={onDoubleClick}
        >
          <Suspense fallback={"loading..."}>
            <Markdown content={content} />
          </Suspense>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-96 text-wrap">
        <Suspense fallback={"loading"}>
          <Markdown content={content} />
        </Suspense>
      </TooltipContent>
    </Tooltip>
  );
}
