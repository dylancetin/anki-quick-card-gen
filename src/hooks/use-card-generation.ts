import { useMutation } from "@tanstack/react-query";
import { useModel } from "./use-ai";
import { usePromptState } from "@/components/global-settings";
import { AIAnkiCardSchema, PreviewCard } from "@/lib/db";
import { streamObject } from "ai";
import { getPrompt } from "@/lib/prompt";
import { toast } from "sonner";
import { Updater } from "use-immer";
import { PDFDocumentProxy } from "pdfjs-dist";

export const useCardGeneration = (
  pdfDoc: PDFDocumentProxy | null,
  setPreviewCards: Updater<PreviewCard[]>,
) => {
  const model = useModel();
  const [systemPrompt] = usePromptState();
  const cardGenMutation = useMutation({
    mutationFn: async ({
      currentPage,
      includePagesContext,
    }: {
      currentPage: number;
      includePagesContext: number;
    }): Promise<void> => {
      if (systemPrompt.length < 5) {
        toast.error("Sistem promptunda sıkıntı var");
        throw new Error("prompt too short");
      }
      const pagesText = `${includePagesContext ? `${currentPage - includePagesContext}-` : ""}${currentPage}`;
      const toastId = toast.loading(`Sayfa ${pagesText} AI cevabı yükleniyor`);
      try {
        const { elementStream } = streamObject({
          schema: AIAnkiCardSchema,
          output: "array",
          model,
          mode: "json",
          system: systemPrompt,
          maxTokens: 5000,
          prompt: await getPrompt({
            includePagesContext,
            pdfDoc,
            currentPage,
          }),
        });

        let count = 0;
        for await (const card of elementStream) {
          ++count;
          toast.loading(`Sayfa  AI cevabı yükleniyor`, {
            id: toastId,
            description: `${count} kart yüklendi`,
          });
          setPreviewCards((d) => {
            d.push({
              ...card,
              page: currentPage,
              fromPage: includePagesContext
                ? currentPage - includePagesContext
                : undefined,
            });
          });
        }

        toast.success(
          `Sayfa ${pagesText} arasında toplam ${count} kart yüklendi`,
          {
            id: toastId,
            duration: 2000,
          },
        );
      } catch (error) {
        toast.error(
          `Sayfa ${pagesText} kartları yüklenirken bir sorun oluştu`,
          {
            id: toastId,
            duration: 2000,
          },
        );

        console.error("Error summarizing page:", error);
      }
    },
  });
  return cardGenMutation;
};
