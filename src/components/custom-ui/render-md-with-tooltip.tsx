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
          className={`${doTruncate ? "truncate **:truncate max-h-14 overflow-y-scroll" : "text-wrap"} max-w-96 cursor-pointer`}
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

export function RenderMd({
  content,
  onDoubleClick,
}: {
  content: string;
  onDoubleClick?: () => void;
}) {
  return (
    <div className="max-w-96 cursor-pointer" onDoubleClick={onDoubleClick}>
      <Suspense fallback={"loading..."}>
        <Markdown content={content} />
      </Suspense>
    </div>
  );
}
