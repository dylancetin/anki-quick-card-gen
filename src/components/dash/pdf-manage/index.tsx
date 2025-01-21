import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export function ManagePDFDash({ file }: { file: File | undefined }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const arrayBuffer = await file!.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
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

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = 620 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

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
    <div className="grid grid-cols-2">
      <div className="flex flex-col items-center w-full min-w-fit">
        <div className="border rounded-sm max-h-[800px] overflow-hidden mx-auto w-full max-w-fit relative">
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
          <span className="self-center">
            Sayfa {currentPage}/{numPages}
          </span>
          <Button onClick={goToNextPage} disabled={currentPage === numPages}>
            Sonraki
          </Button>
        </div>
      </div>
      <div className="w-full"></div>
    </div>
  );
}
