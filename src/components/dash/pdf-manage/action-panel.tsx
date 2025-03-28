import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateObject } from "ai";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useModel } from "@/hooks/ai";
import { toast } from "sonner";
import { getPrompt } from "@/lib/prompt";
import { Label } from "@/components/ui/label";
import { usePromptState } from "@/components/global-settings";
import { AIAnkiCardSchema, PreviewCard } from "@/lib/db";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { useImmer } from "use-immer";
import { AllCards, PreviewModal } from "./preview-dashboard";
import { PdfCanvasDialog } from "./image-card-editor";
import { CreateCardDialog } from "./create-card-dialog";
import { DownloadAllButton } from "./download-all-dialog";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [includePreviousPageContext, setIncludePreviousPageContext] =
    useState(false);
  const [previewCards, setPreviewCards] = useImmer<PreviewCard[]>([]);
  const [openPreview, setOpenPreview] = useState(false);
  const model = useModel();
  const [systemPrompt] = usePromptState();

  const cardGenMutation = useMutation({
    mutationFn: async ({
      currentPage,
      includePreviousPageContext,
    }: {
      currentPage: number;
      includePreviousPageContext: boolean;
    }): Promise<void> => {
      if (systemPrompt.length < 5) {
        toast.error("Sistem promptunda sıkıntı var");
        throw new Error("prompt too short");
      }
      const toastId = toast.loading(
        `Sayfa ${currentPage} AI cevabı yükleniyor`,
      );
      try {
        const { object } = await generateObject({
          schema: AIAnkiCardSchema,
          model,
          mode: "json",
          system: systemPrompt,
          maxTokens: 5000,
          prompt: await getPrompt({
            includePreviousPageContext,
            pdfDoc,
            currentPage,
          }),
        });
        AIAnkiCardSchema.parse(object);
        setPreviewCards((d) => {
          d.push(
            ...object.cards.map((e) => ({
              ...e,
              page: currentPage,
            })),
          );
        });
        toast.success(`Sayfa ${currentPage} AI Kartları yüklendi`, {
          id: toastId,
          duration: 4000,
        });
      } catch (error) {
        toast.error(
          `Sayfa ${currentPage} kartları yüklenirken bir sorun oluştu`,
          {
            id: toastId,
            duration: 4000,
          },
        );

        console.error("Error summarizing page:", error);
      }
    },
  });

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
                Add previous page to the context
              </Label>
              <Switch
                checked={includePreviousPageContext}
                onCheckedChange={(e) =>
                  setIncludePreviousPageContext(e as boolean)
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  cardGenMutation.mutate({
                    currentPage,
                    includePreviousPageContext,
                  })
                }
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
