import { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { toast } from "sonner";

interface PdfCanvasProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
}

interface Box {
  x: number; // Ratio (0-1) relative to cropped area
  y: number; // Ratio (0-1) relative to cropped area
  width: number;
  height: number;
}

export function PdfCanvasDialog({ pdfDoc, currentPage }: PdfCanvasProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant={"blue"}>
          Foto Kart Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <PdfCanvas pdfDoc={pdfDoc} currentPage={currentPage} />
      </DialogContent>
    </Dialog>
  );
}

function PdfCanvas({ pdfDoc, currentPage }: PdfCanvasProps) {
  const [activeTab, setActiveTab] = useState<"crop" | "annotate">("crop");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const croppedImgRef = useRef<HTMLImageElement>(null);

  // Step 1: Render PDF to image
  useEffect(() => {
    if (!pdfDoc) return;

    const renderPdf = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setOriginalDimensions({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: context, viewport }).promise;
      setOriginalImage(canvas.toDataURL());
      canvas.remove();
    };

    renderPdf();
  }, [pdfDoc, currentPage]);

  // Step 2: Handle crop completion
  const handleApplyCrop = async () => {
    if (!imgRef.current) return;

    console.log(crop, originalDimensions);
    const { width, height, x, y } = convertCropToPixels(
      crop,
      originalDimensions,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(imgRef.current, x, y, width, height, 0, 0, width, height);

    setCroppedImage(canvas.toDataURL());
    setActiveTab("annotate");
    canvas.remove();
  };

  // Step 3: Box drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!croppedImgRef.current) return;

    const rect = croppedImgRef.current.getBoundingClientRect();
    const naturalWidth = croppedImgRef.current.naturalWidth;
    const naturalHeight = croppedImgRef.current.naturalHeight;

    const scaleX = naturalWidth / rect.width;
    const scaleY = naturalHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setCurrentBox({
      x: x / naturalWidth,
      y: y / naturalHeight,
      width: 0,
      height: 0,
    });
  };

  const draw = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDrawing || !currentBox || !croppedImgRef.current) return;

    const rect = croppedImgRef.current.getBoundingClientRect();
    const naturalWidth = croppedImgRef.current.naturalWidth;
    const naturalHeight = croppedImgRef.current.naturalHeight;

    const scaleX = naturalWidth / rect.width;
    const scaleY = naturalHeight / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setCurrentBox((prev) => ({
      x: prev!.x,
      y: prev!.y,
      width: mouseX / naturalWidth - prev!.x,
      height: mouseY / naturalHeight - prev!.y,
    }));
  };

  const endDrawing = () => {
    if (
      currentBox &&
      Math.abs(currentBox.width) > 0.01 &&
      Math.abs(currentBox.height) > 0.01
    ) {
      setBoxes((prev) => [...prev, currentBox]);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  // Draw boxes overlay
  useEffect(() => {
    if (!canvasRef.current || !croppedImgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = croppedImgRef.current;

    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;

    // Draw existing boxes
    boxes.forEach((box) => {
      ctx.strokeRect(
        box.x * canvas.width,
        box.y * canvas.height,
        box.width * canvas.width,
        box.height * canvas.height,
      );
    });

    // Draw current box
    if (currentBox) {
      ctx.strokeRect(
        currentBox.x * canvas.width,
        currentBox.y * canvas.height,
        currentBox.width * canvas.width,
        currentBox.height * canvas.height,
      );
    }
  }, [boxes, currentBox]);

  // Final export handler
  const handleExport = () => {
    if (!croppedImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      // Draw cropped image
      ctx.drawImage(img, 0, 0);

      // Export logic
      const dataUrl = canvas.toDataURL("image/webp");
      const imageId = `qai-${crypto.randomUUID()}`;

      db.images.add({ id: imageId, image: dataUrl });
      db.cards.add({ value: { type: "Image Occlusion", boxes, imageId } });
      toast.success("Başarıyla kart oluşturuldu");
      setBoxes([]);
      setCrop({
        unit: "%",
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      });
      setActiveTab("crop");
      canvas.remove();
    };
    img.src = croppedImage;
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="crop" disabled>
            1. Crop
          </TabsTrigger>
          <TabsTrigger value="annotate" disabled>
            2. Add Boxes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crop">
          {originalImage && (
            <div className="relative flex flex-col gap-2 mx-auto w-fit">
              <ReactCrop
                crop={crop}
                onChange={(_, c) => setCrop(c)}
                aspect={undefined}
                className="max-h-[75vh]"
              >
                <img ref={imgRef} src={originalImage} alt="Original document" />
              </ReactCrop>
              <Button className="mt-4" onClick={handleApplyCrop}>
                Apply Crop {"&"} Continue
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="annotate">
          {croppedImage && (
            <div className="relative flex flex-col gap-2 mx-auto w-fit">
              <div className="relative inline-block w-full max-h-[75vh]">
                <img
                  ref={croppedImgRef}
                  src={croppedImage}
                  alt="Cropped document"
                  className="max-h-[75vh]"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  draggable={false}
                  style={{ cursor: "crosshair" }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
              <Button className="mt-4" onClick={handleExport}>
                Export Final Version
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to convert crop to pixels
function convertCropToPixels(
  crop: Crop,
  imgSize: { width: number; height: number },
) {
  if (crop.unit === "%") {
    return {
      x: (imgSize.width * crop.x) / 100,
      y: (imgSize.height * crop.y) / 100,
      width: (imgSize.width * crop.width) / 100,
      height: (imgSize.height * crop.height) / 100,
    };
  }
  return {
    x: crop.x,
    y: crop.y,
    width: crop.width,
    height: crop.height,
  };
}
