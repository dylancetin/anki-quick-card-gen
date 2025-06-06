import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Label } from "@/components/ui/label";
import { PreviewCard } from "@/lib/db";
import { PreviewModal } from "./preview-cards-modal";
import { PdfCanvasDialog } from "./image-card-editor";
import { CreateCardDialog } from "./create-card-dialog";
import { DownloadAllButton } from "./download-all-dialog";
import { Input } from "@/components/ui/input";
import { useImmerLocalStorage } from "@/hooks/use-immer-local-storage";
import { useCardGeneration } from "@/hooks/use-card-generation";
import { RequestCardsDialog } from "./user-request-card-gen-dialog";
import { AllCards } from "./all-cards-modal";
import { useHotkeys } from "react-hotkeys-hook";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [includePagesOffset, setIncludePagesOffset] = useState<number>(0);

  const [startCounting, setStartCounting] = useState(false);
  const [startCountingPage, setStartCountingPage] = useState(0);
  const toggleStartCounting = () => {
    if (startCounting) {
      setStartCounting(false);
      return;
    }
    setStartCountingPage(currentPage);
    setStartCounting(true);
  };

  useEffect(() => {
    if (!startCounting) return;
    const diff = currentPage - startCountingPage;
    if (includePagesOffset !== diff) {
      setIncludePagesOffset(diff);
    }
  }, [startCounting, setIncludePagesOffset, includePagesOffset, currentPage]);

  const [previewCards, setPreviewCards] = useImmerLocalStorage<PreviewCard[]>(
    "preview-cards",
    [],
  );

  const cardGenMutation = useCardGeneration({ pdfDoc, setPreviewCards });
  useHotkeys("q", toggleStartCounting);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="block space-y-4">
        <div className="space-y-2 pt-4">
          <Label className="text-lg block">
            Number of previous pages to include in context
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={1}
              value={includePagesOffset}
              onChange={(e) =>
                setIncludePagesOffset(Number.parseInt(e.target.value) || 0)
              }
              className="w-20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIncludePagesOffset(0);
              }}
            >
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={toggleStartCounting}>
              {!startCounting ? "Start From Current Page" : "Stop"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              cardGenMutation.mutate({
                currentPage,
                includePagesOffset,
              });
              setStartCounting(false);
              setStartCountingPage(0);
              setIncludePagesOffset(0);
            }}
          >
            Create Cards from Current Page
          </Button>
          <CreateCardDialog />
          <RequestCardsDialog
            cardGenMutation={cardGenMutation}
            currentPage={currentPage}
            includePagesOffset={includePagesOffset}
          />
        </div>

        <div className="flex flex-col flex-wrap gap-2">
          <PreviewModal
            previewCards={previewCards}
            setPreviewCards={setPreviewCards}
          />
          <PdfCanvasDialog pdfDoc={pdfDoc} currentPage={currentPage} />
          <AllCards />
          <DownloadAllButton />
        </div>
      </CardContent>
    </Card>
  );
}
