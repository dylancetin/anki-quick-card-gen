import { PDFDocumentProxy } from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { toast } from "sonner";
import DefaultSystemPrompt from "./system-prompt.md?raw";

export function getDefaultSystemPrompt(lang: string | undefined = "TÜRKÇE") {
  const replaceTag = "{{{ CHANGE TO DYNAMIC LANGUAGE}}}";
  return DefaultSystemPrompt.replace(replaceTag, lang);
}

export async function getPrompt({
  includePagesOffset,
  currentPage,
  pdfDoc,
  userRequest,
}: {
  includePagesOffset: number;
  currentPage: number;
  pdfDoc: PDFDocumentProxy | null;
  userRequest?: string;
}): Promise<string | undefined> {
  if (!pdfDoc) {
    toast.error("PDF document could not be loaded — please refresh the page.");
    return;
  }

  // helper to pull raw text from any page and wrap it in tags
  const extractPage = async (
    pageNum: number,
    tagName: string,
  ): Promise<string> => {
    if (pageNum < 1) return "";

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const fullText = textContent.items
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str)
      .join("");

    if (fullText.length < 10) {
      // you can decide whether to toast here or just throw
      toast.error(`Page ${pageNum} is too short for reliable context.`, {
        description:
          "You may need to OCR your PDF or verify this page has selectable text.",
      });
      throw new Error(`Page ${pageNum} text too short`);
    }

    return `<${tagName}>${fullText}</${tagName}>\n\n`;
  };

  let prompt = "";

  // walk backwards for as many pages as requested
  for (let offset = includePagesOffset; offset >= 1; offset--) {
    const pageToGrab = currentPage - offset;
    if (pageToGrab < 1) continue;
    prompt += await extractPage(pageToGrab, "PAGE_CONTEXT");
  }

  // finally, add the actual current page
  prompt += await extractPage(currentPage, "PAGE_CONTENT");

  if (userRequest) {
    const userRequestPrompt =
      "\n" + "<USER_REQUEST>" + userRequest + "</USER_REQUEST>";
    prompt += userRequestPrompt;
  }

  return prompt;
}
