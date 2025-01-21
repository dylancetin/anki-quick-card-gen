import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { LoaderCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}
const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};
export function PDFViewer({
  file,
  currentPage,
  setCurrentPage,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

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

  return (
    <div className="flex flex-col items-center w-full min-w-fit">
      <Document
        file={URL.createObjectURL(file)}
        options={options}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
        }}
        loading={
          <div className="w-full h-full relative min-h-96">
            <LoaderCircle className="animate-spin absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
          </div>
        }
        className={"w-full"}
      >
        <Page
          pageNumber={currentPage}
          className={
            "border rounded-sm max-h-96 overflow-hidden mx-auto w-full max-w-fit"
          }
        />
      </Document>
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
  );
}

export function ManagePDFDash({ file }: { file: File | undefined }) {
  const [currentPage, setCurrentPage] = useState(1);
  if (!file) return null;

  return (
    <div className="grid grid-cols-2">
      <div className="w-full">
        <PDFViewer
          file={file}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <div className="w-full"></div>
    </div>
  );
}
