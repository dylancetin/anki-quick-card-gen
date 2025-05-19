import { AnkiCard, db } from "@/lib/db";
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Datatable, MobileCardNav } from "@/components/custom-ui/datatable";
import { TableNav } from "@/components/custom-ui/datatable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLiveQuery } from "@/hooks/use-live-query";
import { Textarea } from "@/components/ui/textarea";
import { DeleteAllButton } from "./delete-all-cards";
import {
  RenderMd,
  RenderMdWithTooltip,
} from "@/components/custom-ui/render-md-with-tooltip";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Markdown = lazy(
  /* webpackPreload: true */ () => import("@/components/markdown"),
);

const ALL_CARDS_PAGE_SIZE = 8;

export function AllCards() {
  "use no memo";
  const dbCards = useLiveQuery(() => db.cards.reverse().toArray());

  // State for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AnkiCard | null>(null);
  const [editFocusField, setEditFocusField] = useState<"front" | "back" | null>(
    null,
  );

  const handleCellDoubleClick = useCallback(
    (rowIndex: AnkiCard, field: "front" | "back" | null) => {
      setEditingRow(rowIndex);
      setEditFocusField(field);
      setEditDialogOpen(true);
    },
    [setEditDialogOpen, setEditFocusField, setEditingRow],
  );

  const allCardsColumns: ColumnDef<AnkiCard>[] = useMemo(
    () => [
      {
        accessorKey: "value.type",
        header: "Tür",
      },
      {
        header: "Ön-Yüz",
        cell: ({ row }) => {
          if (
            row.original.value.type === "Basic" ||
            row.original.value.type === "Type-in"
          ) {
            return (
              <RenderMdWithTooltip
                content={row.original.value.front}
                onDoubleClick={() =>
                  handleCellDoubleClick(row.original, "front")
                }
              />
            );
          }

          if (row.original.value.type === "Cloze") {
            return (
              <RenderMdWithTooltip
                content={row.original.value.front}
                onDoubleClick={() =>
                  handleCellDoubleClick(row.original, "front")
                }
              />
            );
          }
          if (row.original.value.type === "Image Occlusion") {
            return (
              <ImageOcclusionPreview
                boxes={row.original.value.boxes}
                imageId={row.original.value.imageId}
              />
            );
          }

          return null;
        },
      },
      {
        header: "Arka-Yüz",
        cell: ({ row }) => (
          <RenderMdWithTooltip
            content={
              row.original.value.type === "Basic" ||
              row.original.value.type === "Type-in"
                ? row.original.value.back
                : ""
            }
            onDoubleClick={() => handleCellDoubleClick(row.original, "back")}
          />
        ),
      },
      {
        header: "Aksiyonlar",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="blue"
                onClick={() => {
                  handleCellDoubleClick(row.original, null);
                }}
                disabled={row.original.value.type === "Image Occlusion"}
              >
                Düzenle
              </Button>
              <Button
                onClick={async () => {
                  if (row.original.value.type === "Image Occlusion") {
                    await db.images.delete(row.original.value.imageId);
                  }
                  await db.cards.delete(row.original.id);
                }}
                size={"sm"}
                variant={"destructive"}
              >
                Sil
              </Button>
            </div>
          );
        },
      },
    ],
    [handleCellDoubleClick],
  );

  const table = useReactTable({
    data: dbCards ?? [],
    columns: allCardsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: ALL_CARDS_PAGE_SIZE,
      },
    },
  });
  return (
    <Dialog>
      {/* prefetch markdown */}
      <div className="hidden" aria-hidden>
        <Suspense fallback={""}>
          <Markdown content={""} />
        </Suspense>
      </div>

      <DialogTrigger asChild>
        <Button className="w-full" variant={"cyan"}>
          All Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] min-h-[calc(100vh-32px)] overflow-y-scroll block space-y-4">
        <DialogHeader className="flex flex-col md:flex-row justify-between w-full md:pt-8">
          <div className="space-y-4">
            <DialogTitle>All cards on the depot</DialogTitle>
            <DialogDescription>
              All the cards currently available to be downloaded. Latex ve
              bilimsel notasyon içerenler satır içeriğinde doğru gözükmeyebilir.
              Mouse ile hoverladığında doğrusunu görebilirsin.
            </DialogDescription>
          </div>
          <DeleteAllButton />
        </DialogHeader>
        <Datatable
          isLoading={false}
          table={table}
          columns={allCardsColumns}
          className="rounded-md border max-w-full overflow-x-scroll min-h-[528px] hidden md:block"
        />
        <TableNav table={table} className="hidden md:block" />
        <div className="space-y-4 md:hidden">
          <MobileCardList
            dbCards={dbCards ?? []}
            handleCellDoubleClick={handleCellDoubleClick}
          />
        </div>
        <EditCardComponent
          editDialogOpen={editDialogOpen}
          editingRow={editingRow}
          editFocusField={editFocusField}
          setEditDialogOpen={setEditDialogOpen}
        />
      </DialogContent>
    </Dialog>
  );
}

const MobileCardList = ({
  dbCards,
  handleCellDoubleClick,
}: {
  dbCards: AnkiCard[];
  handleCellDoubleClick: (
    rowIndex: AnkiCard,
    field: "front" | "back" | null,
  ) => void;
}) => {
  const [index, setIndex] = useState(0);
  const currentCard: AnkiCard | undefined = dbCards?.[index];
  if (!currentCard) {
    return (
      <>
        <Card>Kart Bulunamadı</Card>
        <MobileCardNav array={dbCards} index={index} setIndex={setIndex} />
      </>
    );
  }

  const currentCardValue: AnkiCard["value"] = currentCard.value;

  if (currentCardValue.type === "Image Occlusion") {
    return (
      <>
        <Card>
          <ImageOcclusionCard
            imageId={currentCardValue.imageId}
            boxes={currentCardValue.boxes}
          />
          <CardFooter className="justify-center gap-2">
            <Button
              onClick={async () => {
                await db.images.delete(currentCardValue.imageId);
                await db.cards.delete(currentCard.id);
              }}
              size={"sm"}
              variant={"destructive"}
            >
              Sil
            </Button>
          </CardFooter>
        </Card>
        <MobileCardNav array={dbCards} index={index} setIndex={setIndex} />
      </>
    );
  }

  return (
    <>
      <Card>
        <div className="mx-auto px-2 py-4 min-h-96 space-y-4">
          <RenderMd
            content={currentCardValue.front}
            onDoubleClick={() => handleCellDoubleClick(currentCard, null)}
          />
          {currentCardValue.type !== "Cloze" ? (
            <>
              <Separator />
              <RenderMd
                content={currentCardValue.back}
                onDoubleClick={() => handleCellDoubleClick(currentCard, null)}
              />
            </>
          ) : null}
        </div>
        <CardFooter className="justify-center gap-2">
          <Button
            size="sm"
            variant="blue"
            onClick={() => {
              handleCellDoubleClick(currentCard, null);
            }}
          >
            Düzenle
          </Button>
          <Button
            onClick={async () => {
              await db.cards.delete(currentCard.id);
            }}
            size={"sm"}
            variant={"destructive"}
          >
            Sil
          </Button>
        </CardFooter>
      </Card>
      <MobileCardNav array={dbCards} index={index} setIndex={setIndex} />
    </>
  );
};

export const ImageOcclusionCard = ({
  imageId,
  boxes,
}: {
  imageId: string;
  boxes: Array<{ x: number; y: number; width: number; height: number }>;
}) => {
  const image = useLiveQuery(() => db.images.get(imageId));
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="relative inline-block max-w-full mx-2 my-4">
      {image && (
        <div className="relative">
          <img
            ref={imgRef}
            src={image.image}
            alt="Occlusion preview"
            className="w-96 max-h-[500px] object-contain"
          />
          {/* Boxes container */}
          <div className="absolute top-0 left-0 w-full h-full">
            {boxes.map((box, index) => (
              <div
                key={index}
                className="absolute bg-red-500/80 pointer-events-none"
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export const ImageOcclusionPreview = ({
  imageId,
  boxes,
}: {
  imageId: string;
  boxes: Array<{ x: number; y: number; width: number; height: number }>;
}) => {
  const image = useLiveQuery(() => db.images.get(imageId));
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-sm">
          <p>{boxes.length} occlusion boxes</p>
          <p>Click to edit</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="relative inline-block max-w-full">
          {image && (
            <div className="relative">
              <img
                ref={imgRef}
                src={image.image}
                alt="Occlusion preview"
                className="w-96 max-h-[500px] object-contain"
              />
              {/* Boxes container */}
              <div className="absolute top-0 left-0 w-full h-full">
                {boxes.map((box, index) => (
                  <div
                    key={index}
                    className="absolute bg-red-500/80 pointer-events-none"
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const EditCardComponent = ({
  editDialogOpen,
  editingRow,
  editFocusField,
  setEditDialogOpen,
}: {
  editDialogOpen: boolean;
  editingRow: AnkiCard | null;
  editFocusField: "front" | "back" | null;
  setEditDialogOpen: React.Dispatch<boolean>;
}) => {
  "use no memo";
  const [frontContent, setFrontContent] = useState(
    // @ts-ignore
    editingRow?.value.front || "",
  );
  const [backContent, setBackContent] = useState(
    // @ts-ignore
    editingRow?.value.back || "",
  );

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

  // Reset content when dialog opens or card changes
  useEffect(() => {
    if (editDialogOpen) {
      if (!editingRow) {
        return;
      }
      if (editingRow.value.type === "Image Occlusion") {
        return;
      }

      setFrontContent(editingRow.value.front || "");
      if (editingRow.value.type !== "Cloze")
        setBackContent(editingRow.value.back || "");
    }
  }, [editDialogOpen, editingRow, setFrontContent, setBackContent]);

  // Focus the appropriate field when the dialog opens
  useEffect(() => {
    setTimeout(() => {
      if (editDialogOpen && editFocusField) {
        if (editFocusField === "front" && frontRef.current) {
          frontRef.current.focus();
          frontRef.current.setSelectionRange(0, frontRef.current.value.length);
        } else if (editFocusField === "back" && backRef.current) {
          backRef.current.focus();
          backRef.current.setSelectionRange(0, backRef.current.value.length);
        }
      }
    }, 10);
  }, [editDialogOpen, editFocusField, frontRef, backRef]);

  const handleSave = async () => {
    if (!editingRow || editingRow.value.type === "Image Occlusion") {
      return;
    }
    await db.cards.update(editingRow.id, {
      ...(editingRow.value.type !== "Cloze"
        ? { "value.back": backContent }
        : undefined),
      // @ts-ignore
      "value.front": frontContent,
    });
    setEditDialogOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };
  return (
    <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Kartı Düzenle</AlertDialogTitle>
          <AlertDialogDescription>
            Kartın içeriğini düzenleyip kaydedebilirsiniz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 my-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Ön-Yüz</label>
            <Textarea
              ref={frontRef}
              value={frontContent}
              onChange={(e) => setFrontContent(e.target.value)}
              placeholder="Ön-Yüz metni"
              rows={4}
              onKeyDown={handleKeyDown}
            />
          </div>
          {(editingRow?.value.type === "Basic" ||
            editingRow?.value.type === "Type-in") && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Arka-Yüz</label>
              <Textarea
                ref={backRef}
                value={backContent}
                onChange={(e) => setBackContent(e.target.value)}
                placeholder="Arka-Yüz metni"
                rows={4}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>
            Düzenlemeyi Kaydet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
