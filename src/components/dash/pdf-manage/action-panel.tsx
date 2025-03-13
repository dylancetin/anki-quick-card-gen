import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateObject } from "ai";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useModel } from "@/hooks/ai";
import { toast } from "sonner";
import { getPrompt, getSystemPrompt } from "@/lib/prompt";
import { Label } from "@/components/ui/label";
import { useGlobalSettingsState } from "@/components/global-settings";
import { AIAnkiCard, AIAnkiCardSchema, AnkiCard, db } from "@/lib/db";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { useImmer } from "use-immer";
import { AllCards, PreviewModal } from "./preview-dashboard";
import Papa from "papaparse";
import { txtHead } from "@/lib/cardsTxtHead";
import { PdfCanvasDialog } from "./image-card-editor";
import JSZip from "jszip";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [includePreviousPageContext, setIncludePreviousPageContext] =
    useState(false);
  const [settings, _] = useGlobalSettingsState();
  const [previewCards, setPreviewCards] = useImmer<AIAnkiCard["cards"]>([]);
  const [openPreview, setOpenPreview] = useState(false);
  const model = useModel();

  const cardGenMutation = useMutation({
    mutationFn: async () => {
      const toastId = toast.loading(
        `Sayfa ${currentPage} AI cevabı yükleniyor`,
      );
      try {
        const { object } = await generateObject({
          schema: AIAnkiCardSchema,
          model,
          mode: "json",
          system: getSystemPrompt({ settings }),
          maxTokens: 5000,
          prompt: await getPrompt({
            includePreviousPageContext,
            pdfDoc,
            currentPage,
          }),
        });
        AIAnkiCardSchema.parse(object);
        setPreviewCards((d) => {
          d.push(...object.cards);
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

  async function downloadAllCards() {
    const allCards: AnkiCard["value"][] = (await db.cards.toArray()).map(
      (d) => d.value,
    );
    console.log(allCards);

    // Convert the array of cards to CSV
    const neededImagIds: string[] = [];
    const csv = Papa.unparse(
      allCards.map((c) => {
        switch (c.type) {
          case "Basic": {
            return [c.type, c.front, c.back];
          }
          case "Type-in": {
            return [c.type, c.front, c.back];
          }
          case "Cloze": {
            return [c.type, c.front];
          }
          case "Image Occlusion": {
            neededImagIds.push(c.imageId);
            return [
              c.type,
              c.boxes
                .map(
                  (b, i) =>
                    `{{c${i + 1}::image-occlusion:rect:left=${b.x}:top=${b.y}:width=${b.width}:height=${b.height}:oi=1}}`,
                )
                .join(" "),
              `<img src="${c.imageId}.webp">`,
            ];
          }
        }
      }),
      {
        header: false,
      },
    );

    // Create a blob from the CSV string
    const blob = new Blob([txtHead, csv], { type: "text/txt;charset=utf-8;" });

    const zip = new JSZip();
    zip.file("cards.txt", blob);

    const imgFolder = zip.folder("images");

    if (!imgFolder) {
      console.error("sometgng went terribly wrong");
      return;
    }

    await Promise.allSettled(
      neededImagIds.map(async (imageId) => {
        const imageData = await db.images.get(imageId);
        if (!imageData) {
          return;
        }
        imgFolder.file(`${imageId}.webp`, imageData.image.split(",")[1], {
          base64: true,
        });
      }),
    );

    // Create a link element
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(zipBlob);
    link.setAttribute("href", url);
    link.setAttribute("download", "all_cards.zip"); // Set the desired file name

    // Append to the body (required for Firefox)
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up and remove the link
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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
            <div className="space-y-2">
              <Label className="text-lg block">
                Bir önceki sayfayı bağlama ekle
              </Label>
              <Switch
                checked={includePreviousPageContext}
                onCheckedChange={(e) =>
                  setIncludePreviousPageContext(e as boolean)
                }
              />
            </div>
            <Button
              onClick={() => cardGenMutation.mutate()}
              // disabled={cardGenMutation.isPending}
            >
              Mevcut sayfadan kart oluştur
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col flex-wrap gap-2">
          <Button
            onClick={() => setOpenPreview(true)}
            className="w-full"
            variant={"purple"}
          >
            Önizleme tablosunu aç
          </Button>
          <PdfCanvasDialog pdfDoc={pdfDoc} currentPage={currentPage} />
          <AllCards />
          <Button
            onClick={downloadAllCards}
            className="w-full"
            variant={"green"}
          >
            Kartları indir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
