import { useMutation } from "@tanstack/react-query";
import { useModel } from "./use-ai";
import { usePromptState } from "@/components/global-settings";
import { AIAnkiCardSchema, PreviewCard } from "@/lib/db";
import { streamObject } from "ai";
import { getPrompt } from "@/lib/prompt";
import { toast } from "sonner";
import { Updater } from "use-immer";
import { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect } from "react";

export const useCardGeneration = (
  pdfDoc: PDFDocumentProxy | null,
  setPreviewCards: Updater<PreviewCard[]>,
) => {
  const model = useModel();
  const [systemPrompt] = usePromptState();
  const cardGenMutation = useMutation({
    mutationFn: async ({
      currentPage,
      includePagesOffset,
    }: {
      currentPage: number;
      includePagesOffset: number;
    }): Promise<void> => {
      console.log({ currentPage, includePagesOffset });
      if (
        typeof currentPage !== "number" ||
        typeof includePagesOffset !== "number" ||
        currentPage <= includePagesOffset
      ) {
        toast.error("Girdi type hatası!");
        return;
      }

      const controller = new AbortController();
      const signal = controller.signal;
      if (systemPrompt.length < 5) {
        toast.error("Sistem promptunda sıkıntı var");
        throw new Error("prompt too short");
      }
      const pagesText = `${includePagesOffset ? `${currentPage - includePagesOffset}-` : ""}${currentPage}`;
      const toastId = toast.loading(`Sayfa ${pagesText} AI cevabı yükleniyor`, {
        action: {
          label: "İptal Et",
          onClick: () => controller.abort(),
        },
      });
      try {
        const { elementStream } = streamObject({
          schema: AIAnkiCardSchema,
          output: "array",
          model,
          mode: "json",
          system: systemPrompt,
          maxTokens: 5000,
          prompt: await getPrompt({
            includePagesOffset,
            pdfDoc,
            currentPage,
          }),
          abortSignal: signal,
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
              fromPage: includePagesOffset
                ? currentPage - includePagesOffset
                : undefined,
            });
          });
        }

        toast.success(
          `Sayfa ${pagesText} arasında toplam ${count} kart yüklendi`,
          {
            id: toastId,
            duration: 2000,
            action: undefined,
          },
        );
      } catch (error) {
        toast.error(
          `Sayfa ${pagesText} kartları yüklenirken bir sorun oluştu`,
          {
            id: toastId,
            duration: 2000,
            action: undefined,
          },
        );

        console.error("Error summarizing page:", error);
      }
    },
  });
  useEffect(() => {
    // @ts-ignore
    globalThis.cardGen = cardGenMutation.mutate;
    // @ts-ignore
    globalThis.cardGenInfo = {
      currentPage: "number",
      includePagesOffset: "number",
    };
    return () => {
      // @ts-ignore
      globalThis.cardGen = undefined;
      // @ts-ignore
      globalThis.cardGenInfo = undefined;
    };
  }, [cardGenMutation.mutate]);

  return cardGenMutation;
};
