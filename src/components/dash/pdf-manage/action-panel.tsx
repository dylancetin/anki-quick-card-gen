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
import { errorAndSuccessToasts } from "@/lib/useMutationDefaultToasts";
import { Switch } from "@/components/ui/switch";
import { useImmer } from "use-immer";
import { AllCards, PreviewModal } from "./preview-dashboard";
import Papa from "papaparse";
import { txtHead } from "@/lib/cardsTxtHead";
import { PdfCanvasDialog } from "./image-card-editor";
import JSZip from "jszip";
import { TextItem } from "pdfjs-dist/types/src/display/api";

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
    ...errorAndSuccessToasts,
    mutationFn: async () => {
      const toastId = toast.loading("AI cevabı yükleniyor");
      try {
        const { object } = await generateObject({
          schema: AIAnkiCardSchema,
          // @ts-ignore
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
        toast.success("AI Kartları yüklendi lütfen kartları onaylayın", {
          id: toastId,
          duration: 4000,
        });

        // db.cards.bulkAdd(object.cards.map((c) => ({ value: c })));
      } catch (error) {
        toast.error("AI Kartları yüklenirken bi sorun oluştu", {
          id: toastId,
          duration: 4000,
        });

        console.error("Error summarizing page:", error);
      }
    },
  });

  async function convertPageToPNG() {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(currentPage);

      // Set the scale for rendering (1 = 100%)
      const scale = 1;
      const viewport = page.getViewport({ scale });

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      if (!context) {
        toast.error("Bir şey yanlış oldu");
        return;
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to PNG
      // Convert canvas to PNG and open in new tab
      const webpDataUrl = canvas.toDataURL("image/webp");
      const link = document.createElement("a");
      link.href = webpDataUrl;
      link.download = "pdf-page.webp";
      link.target = "_blank";
      link.click();
    } catch (error) {
      console.error("Error converting PDF to PNG:", error);
      throw error;
    }
  }

  async function downloadAllCards() {
    const allCards: AnkiCard["value"][] = (await db.cards.toArray()).map(
      (d) => d.value,
    );
    console.log(allCards);

    // Convert the array of cards to CSV
    //
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
              disabled={cardGenMutation.isPending}
            >
              Mevcut sayfadan kart oluştur
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Button onClick={convertPageToPNG}>
            Mevcut sayfayı foto olarak indir
          </Button>
          <Button onClick={() => setOpenPreview(true)}>
            Önizleme tablosunu aç
          </Button>
          <Button onClick={downloadAllCards}>Kartları indir</Button>
          <PdfCanvasDialog pdfDoc={pdfDoc} currentPage={currentPage} />
          <AllCards />
          <Button
            onClick={async () => {
              const page = await pdfDoc!.getPage(currentPage);
              const textContent = await page.getTextContent();
              console.log(textContent);
              const fullText = textContent.items
                .filter((item): item is TextItem => "str" in item) // Type guard to filter TextItem
                .map((item) => item.str) // Extract the string from each TextItem
                .join(""); // Join them with a space
              console.log(page.commonObjs);

              console.log(`<PAGE_CONTENT>${fullText}</PAGE_CONTENT>\n\n`);
            }}
          >
            Sayfa texti logla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
