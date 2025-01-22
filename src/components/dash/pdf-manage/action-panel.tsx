import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateText } from "ai";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useOpenAi } from "@/hooks/openai";
import { toast } from "sonner";

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export function ActionsPanel({ pdfDoc, currentPage }: ActionsPanelProps) {
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const openai = useOpenAi();

  const extractTextFromPage = async () => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(currentPage);
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(" ");
  };

  const summarizePage = async () => {
    setLoading(true);
    try {
      const pageText = await extractTextFromPage();
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Summarize the following text in 2-3 sentences: ${pageText}`,
      });
      setSummary(text);
    } catch (error) {
      console.error("Error summarizing page:", error);
      setSummary("Error generating summary.");
    }
    setLoading(false);
  };

  const extractKeywords = async () => {
    setLoading(true);
    try {
      const pageText = await extractTextFromPage();
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Extract 5 key words or phrases from the following text: ${pageText}`,
      });
      setKeywords(text.split(",").map((keyword) => keyword.trim()));
    } catch (error) {
      console.error("Error extracting keywords:", error);
      setKeywords(["Error extracting keywords"]);
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
      <CardContent className="space-y-4">
        <Button onClick={summarizePage} disabled={loading}>
          Summarize Page
        </Button>
        <Button onClick={extractKeywords} disabled={loading}>
          Extract Keywords
        </Button>
        <Button onClick={convertPageToPNG}>foto olarak indir</Button>
        {summary && (
          <div>
            <h3 className="font-bold">Summary:</h3>
            <p>{summary}</p>
          </div>
        )}
        {keywords.length > 0 && (
          <div>
            <h3 className="font-bold">Keywords:</h3>
            <ul className="list-disc list-inside">
              {keywords.map((keyword, index) => (
                <li key={index}>{keyword}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
