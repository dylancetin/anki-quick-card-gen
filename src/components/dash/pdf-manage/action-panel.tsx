import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Label } from "@/components/ui/label";
import { PreviewCard } from "@/lib/db";
import { AllCards, PreviewModal } from "./preview-dashboard";
import { PdfCanvasDialog } from "./image-card-editor";
import { CreateCardDialog } from "./create-card-dialog";
import { DownloadAllButton } from "./download-all-dialog";
import { Input } from "@/components/ui/input";
import { useImmerLocalStorage } from "@/hooks/use-immer-local-storage";
import { useCardGeneration } from "@/hooks/use-card-generation";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [openPreview, setOpenPreview] = useState(false);

  const [includePagesContext, setIncludePagesContext] = useState<number>(0);
  const [startCounting, setStartCounting] = useState(false);
  const [startCountingPage, setStartCountingPage] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    const diff = currentPage - startCountingPage;
    if (includePagesContext !== diff) {
      setIncludePagesContext(diff);
    }
  }, [startCounting, setIncludePagesContext, includePagesContext, currentPage]);

  const [previewCards, setPreviewCards] = useImmerLocalStorage<PreviewCard[]>(
    "preview-cards",
    [],
  );

  const cardGenMutation = useCardGeneration(pdfDoc, setPreviewCards);

  return (
    <Card>
      <PreviewModal
        open={openPreview}
        setOpen={setOpenPreview}
        previewCards={previewCards}
        setPreviewCards={setPreviewCards}
      />
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="block space-y-4">
        <Card>
          <CardContent className="block space-y-4">
            <div className="space-y-2 pt-4">
              <Label className="text-lg block">
                Number of previous pages to include in context
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={includePagesContext}
                  onChange={(e) =>
                    setIncludePagesContext(Number.parseInt(e.target.value) || 0)
                  }
                  className="w-20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIncludePagesContext(0);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (startCounting) {
                      setStartCounting(false);
                      return;
                    }
                    setStartCountingPage(currentPage);
                    setStartCounting(true);
                  }}
                >
                  {!startCounting ? "Start From Current Page" : "Stop"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  cardGenMutation.mutate({
                    currentPage,
                    includePagesContext,
                  });
                  setStartCounting(false);
                  setStartCountingPage(0);
                  setIncludePagesContext(0);
                }}
              >
                Create Cards from Current Page
              </Button>
              <CreateCardDialog />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col flex-wrap gap-2">
          <Button
            onClick={() => setOpenPreview(true)}
            className="w-full"
            variant={"purple"}
          >
            Open Preview Table
          </Button>
          <PdfCanvasDialog pdfDoc={pdfDoc} currentPage={currentPage} />
          <AllCards />
          <DownloadAllButton />
        </div>
      </CardContent>
    </Card>
  );
}
