import { GlobalSettings } from "@/components/global-settings";
import { PDFDocumentProxy } from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { toast } from "sonner";

export function getSystemPrompt({ settings }: { settings: GlobalSettings }) {
  return `<SYSTEM>
You are a LLM assistant for a student. Your job is very critical for the students success.

Your job is simple, yet it is very important that you understand each step and proceed accordingly.

1. User will provide you content from a textbook page. You need to analyze and spot key points that the student needs to learn
2. User can provide you previos page's context so that you can continue analyzing the page
3. You will answer in JSON format an array of Anki cards (a popular FOSS app) there are 3 types of cards
	a. Basic:
			Basic card is pretty simple there is a front of the card and back of the card
			example: {
				"type":"Basic", // this is constant and is required
				"front": "Bir bölgedeki hayvan türlerinin tamamına verilen isimdir.",
				"back": "Fauna"
			}
	b. Cloze: 
			Cloze card is more complicated. It hides a part of the text. There can be multiple clozes in a text. the number after "c" spesifies the number of cloze. It needs to start from 1 to as many as you put.
			example: {
				"type":"Cloze", // this is constant and is required
				"content": "{{c1::Sitoplazmada}} besin dolaşımını, yağ ve hormon sentezini sağlayan, hücre zarı ve çekirdek zarı arasında yer almış tek zarlı bir sıra karışık kanallar sistemidir."
			}
	c. Type-in:
			Type-in card is similar to basic but with a twist. Student needs to type in the answer. So these cards' answers needs to be short or tricky to write.
			example: {
				"type": "Type-in", // this is constant and is required
				"front": "Tilakoitlerin bir araya gelmesiyle oluşan kümelere ne adı verilir?",
				"back": "Granum"
			}
4. SELECT ONLY one of these card types per card. Answer in a array of objects with the type provided.
5. ONLY ANSWER IN THE LANGUAGE OF **${settings.lang ?? "TÜRKÇE"}** in the contents of the card
</SYSTEM>`;
}

export async function getPrompt({
  includePreviousPageContext,
  currentPage,
  pdfDoc,
}: {
  includePreviousPageContext: boolean;
  currentPage: number;
  pdfDoc: PDFDocumentProxy | null;
}) {
  if (!pdfDoc) {
    toast.error("PDF Dökümanı yüklenemedi sayfayı yeniyelin");
    return;
  }
  const previousPageContent = async () => {
    const page = await pdfDoc.getPage(currentPage - 1);
    const textContent = await page.getTextContent();
    return `<PREVIOUS_PAGE_CONTEXT>${textContent}</PREVIOUS_PAGE_CONTEXT>\n\n`;
  };
  const pageContent = async () => {
    const page = await pdfDoc.getPage(currentPage);
    const textContent = await page.getTextContent();
    console.log(textContent);
    const fullText = textContent.items
      .filter((item): item is TextItem => "str" in item) // Type guard to filter TextItem
      .map((item) => item.str) // Extract the string from each TextItem
      .join(" "); // Join them with a space

    return `<PAGE_CONTENT>${fullText}</PAGE_CONTENT>\n\n`;
  };

  return `${includePreviousPageContext ? await previousPageContent() : ""}${await pageContent()}`;
}
