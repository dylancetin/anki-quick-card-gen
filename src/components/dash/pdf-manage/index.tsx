import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { ActionsPanel } from "./action-panel";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useCreatePreviewImg } from "@/hooks/use-current-page";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export function ManagePDFDash({
  file,
  currentPage,
  setCurrentPage,
}: {
  file: File | undefined;
  currentPage: number;
  setCurrentPage: (e: number) => void;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const arrayBuffer = await file!.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          useSystemFonts: false,
          disableFontFace: false,
          fontExtraProperties: true, // Enable detailed font analysis
        }).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPDF();

    return () => {
      pdfDoc?.destroy();
    };
  }, [file]);

  useCreatePreviewImg(pdfDoc, file);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        const scaledViewport = page.getViewport({ scale: 4 });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        setLoading(false);
      } catch (error) {
        console.error("Error rendering page:", error);
        setLoading(false);
      }
    };

    renderPage();
  }, [currentPage, pdfDoc]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < (numPages || 0)) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!file) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center w-full min-w-fit">
        <div className="border rounded-sm max-h-[800px] overflow-x-hidden overflow-y-scroll mx-auto w-full max-w-fit relative">
          {loading && (
            <div className="w-full h-full absolute left-0 top-0 min-h-[620px]">
              <LoaderCircle className="animate-spin absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
            </div>
          )}
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <div className="mt-4 flex gap-4">
          <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Önceki
          </Button>
          <Popover>
            <PopoverTrigger>
              <span className="self-center">
                Page {currentPage}/{numPages}
              </span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto space-y-4"
              align="center"
              side="top"
            >
              <div className="text-bw-600 text-xs ">Sayfa</div>
              <Input
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    const inputValue = event.currentTarget.value;
                    if (inputValue) {
                      const page = Number(inputValue); // Sayfa indeksi 0'dan başladığı için 1 çıkarıyoruz
                      if (page <= (numPages ?? 1)) {
                        setCurrentPage(page);
                      }
                      if (page < 0) {
                        toast.error("Sayfa bulunamadı", {
                          description: "Girilen sayfa 0'dan daha küçük olamaz.",
                          duration: 2500,
                        });
                      } else {
                        toast.error("Sayfa bulunamadı", {
                          description: `Girilen sayfa mevcut sayfa sayısından (${numPages}) daha büyük olamaz.`,
                          duration: 2500,
                        });
                      }
                    }
                  }
                }}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={goToNextPage} disabled={currentPage === numPages}>
            Sonraki
          </Button>
        </div>
      </div>
      <div className="w-full">
        <ActionsPanel pdfDoc={pdfDoc} currentPage={currentPage} />
      </div>
    </div>
  );
}
