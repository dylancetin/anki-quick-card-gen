import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { PDFDocumentProxy } from "pdfjs-dist";

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
  apiKey: "",
});

interface ActionsPanelProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

export default function ActionsPanel({
  pdfDoc,
  currentPage,
}: ActionsPanelProps) {
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
