import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateObject } from "ai";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useModel } from "@/hooks/ai";
import { toast } from "sonner";
import { getPrompt, getSystemPrompt } from "@/lib/prompt";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGlobalSettingsState } from "@/components/global-settings";
import { AIAnkiCardSchema } from "@/lib/db";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [includePreviousPageContext, setIncludePreviousPageContext] =
    useState(false);
  const [settings, _] = useGlobalSettingsState();
  const model = useModel();

  const summarizePage = async () => {
    setLoading(true);
    try {
      const { object } = await generateObject({
        schema: AIAnkiCardSchema,
        // @ts-ignore
        model,
        system: getSystemPrompt({ settings }),
        prompt: await getPrompt({
          includePreviousPageContext,
          pdfDoc,
          currentPage,
        }),
        experimental_providerMetadata: {},
      });
      setSummary(JSON.stringify(object));
    } catch (error) {
      console.error("Error summarizing page:", error);
      setSummary("Error generating summary.");
    }
    setLoading(false);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="block space-y-4">
        <Button onClick={summarizePage} disabled={loading}>
          gönder
        </Button>
        <div className="space-x-2">
          <Label>bi önceki sayfayı da ekle</Label>
          <Checkbox
            checked={includePreviousPageContext}
            onCheckedChange={(e) => setIncludePreviousPageContext(e as boolean)}
          />
        </div>
        <Button onClick={convertPageToPNG}>foto olarak indir</Button>
        {summary && (
          <div>
            <h3 className="font-bold">Summary:</h3>
            <p>{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
