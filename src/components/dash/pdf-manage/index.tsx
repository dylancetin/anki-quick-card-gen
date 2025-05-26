import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { ActionsPanel } from "./action-panel";
import { useCreatePreviewImg } from "@/hooks/use-pdf";
import { PaginationButtons } from "@/components/custom-ui/pagination";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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

  const openPdfOnANewTab = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = `${url}#page=${currentPage}`;
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();

    link.addEventListener(
      "click",
      () => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      },
      { once: true },
    );
  };

  if (!file) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col items-center w-full min-w-fit">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="border rounded-sm max-h-[800px] overflow-x-hidden overflow-y-scroll mx-auto w-full max-w-fit relative">
              {loading && (
                <div className="w-full h-full absolute left-0 top-0 min-h-[620px]">
                  <LoaderCircle className="animate-spin absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                </div>
              )}
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={openPdfOnANewTab}>
              PDF'i yeni tab'de aç
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <PaginationButtons
          currentPage={currentPage}
          numPages={numPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <div className="w-full">
        <ActionsPanel pdfDoc={pdfDoc} currentPage={currentPage} />
      </div>
    </div>
  );
}
