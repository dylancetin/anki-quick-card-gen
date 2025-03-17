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
import { Trash2 } from "lucide-react"; // Import trash icon

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
          Add Image Card
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
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
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

    // If we're clicking on an existing box, select it instead of drawing
    const clickedBoxIndex = getBoxAtPosition(e);
    if (clickedBoxIndex !== null) {
      setSelectedBoxIndex(clickedBoxIndex);
      return;
    }

    // Clear selection when starting to draw a new box
    setSelectedBoxIndex(null);

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
      // Normalize box dimensions if drawn in reverse direction
      const normalizedBox = {
        x:
          currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y:
          currentBox.height < 0
            ? currentBox.y + currentBox.height
            : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
      };

      setBoxes((prev) => [...prev, normalizedBox]);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  // Function to check if a click hits an existing box
  const getBoxAtPosition = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!croppedImgRef.current || boxes.length === 0) return null;

    const rect = croppedImgRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Check if click is inside any box
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      const boxX = box.x * canvas.width;
      const boxY = box.y * canvas.height;
      const boxWidth = box.width * canvas.width;
      const boxHeight = box.height * canvas.height;

      if (
        canvasX >= boxX &&
        canvasX <= boxX + boxWidth &&
        canvasY >= boxY &&
        canvasY <= boxY + boxHeight
      ) {
        return i;
      }
    }

    return null;
  };

  // Remove selected box
  const removeSelectedBox = () => {
    if (selectedBoxIndex !== null) {
      setBoxes(boxes.filter((_, index) => index !== selectedBoxIndex));
      setSelectedBoxIndex(null);
      toast.success("Box removed");
    }
  };

  // Handle keydown for delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedBoxIndex !== null
      ) {
        removeSelectedBox();
      }
      // Escape key to deselect
      if (e.key === "Escape") {
        setSelectedBoxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBoxIndex, boxes]);

  // Draw boxes overlay
  useEffect(() => {
    if (!canvasRef.current || !croppedImgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = croppedImgRef.current;

    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing boxes
    boxes.forEach((box, index) => {
      // Selected box has a different style
      if (index === selectedBoxIndex) {
        ctx.strokeStyle = "#00ff00"; // Green for selected box
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "#ff0000"; // Red for normal boxes
        ctx.lineWidth = 2;
      }

      ctx.strokeRect(
        box.x * canvas.width,
        box.y * canvas.height,
        box.width * canvas.width,
        box.height * canvas.height,
      );
    });

    // Draw current box
    if (currentBox) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;

      // Calculate normalized coordinates for drawing
      const normalizedX =
        currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x;
      const normalizedY =
        currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y;
      const normalizedWidth = Math.abs(currentBox.width);
      const normalizedHeight = Math.abs(currentBox.height);

      ctx.strokeRect(
        normalizedX * canvas.width,
        normalizedY * canvas.height,
        normalizedWidth * canvas.width,
        normalizedHeight * canvas.height,
      );
    }
  }, [boxes, currentBox, selectedBoxIndex]);

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
              <div className="relative inline-block w-full max-h-[70vh]">
                <img
                  ref={croppedImgRef}
                  src={croppedImage}
                  alt="Cropped document"
                  className="max-h-[70vh]"
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
              <div className="flex gap-2 mt-4">
                <Button variant={"outline"}>{boxes.length} Boxes</Button>

                <Button
                  variant="destructive"
                  onClick={removeSelectedBox}
                  disabled={selectedBoxIndex === null}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Selected Box
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                {selectedBoxIndex !== null
                  ? "Press Delete or Backspace to remove the selected box, or Escape to deselect."
                  : "Click on a box to select it for removal."}
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
