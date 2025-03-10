import { AIAnkiCard, AnkiCard, db } from "@/lib/db";
import {
  useRef,
  useMemo,
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
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
  Row,
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
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Datatable } from "@/components/custom-ui/datatable";
import { TableNav } from "@/components/custom-ui/datatable";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "@tanstack/react-router";
import { Updater } from "use-immer";
import { useLiveQuery } from "dexie-react-hooks";
import { Textarea } from "@/components/ui/textarea";

const renderStringWithHighlight = (str: string) => {
  const regex = /{{(c\d+)::(.*?)}}/g;
  const parts = str.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 3 === 0) {
          return <span key={index}>{part}</span>; // Regular text
        } else if (index % 3 === 1) {
          return (
            <Badge
              className="inline"
              key={index}
            >{`${parts[index + 1]} (${part.replace("c", "")})`}</Badge>
          ); // Highlighted text
        }
        return null; // Skip the second capturing group
      })}
    </>
  );
};

function RenderTooltipContent({
  content,
  onDoubleClick,
}: {
  content: ReactNode;
  onDoubleClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="truncate max-w-96 cursor-pointer"
          onDoubleClick={onDoubleClick}
        >
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-96 text-wrap">
        <p className="max-w-96 text-wrap inline-flex flex-wrap">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function PreviewModal({
  open,
  setOpen,
  previewCards,
  setPreviewCards,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  previewCards: AIAnkiCard["cards"];
  setPreviewCards: Updater<AIAnkiCard["cards"]>;
}) {
  "use no memo";
  function saveToDB(card: AIAnkiCard["cards"][number]) {
    db.cards.add({ value: card });
  }

  // State for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editFocusField, setEditFocusField] = useState<"front" | "back" | null>(
    null,
  );

  const handleCellDoubleClick = (rowIndex: number, field: "front" | "back") => {
    setEditingRowIndex(rowIndex);
    setEditFocusField(field);
    setEditDialogOpen(true);
  };

  const columns: ColumnDef<AIAnkiCard["cards"][number]>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Tür",
      },
      {
        header: "Ön-Yüz",
        cell: ({ row }) => {
          if (
            row.original.type === "Basic" ||
            row.original.type === "Type-in"
          ) {
            return (
              <RenderTooltipContent
                content={row.original.front}
                onDoubleClick={() => handleCellDoubleClick(row.index, "front")}
              />
            );
          }

          if (row.original.type === "Cloze") {
            return (
              <RenderTooltipContent
                content={renderStringWithHighlight(row.original.front)}
                onDoubleClick={() => handleCellDoubleClick(row.index, "front")}
              />
            );
          }

          return null;
        },
      },
      {
        accessorKey: "back",
        header: "Arka-Yüz",
        cell: ({ getValue, row }) => (
          <RenderTooltipContent
            content={getValue()}
            onDoubleClick={() => {
              if (
                row.original.type === "Basic" ||
                row.original.type === "Type-in"
              ) {
                handleCellDoubleClick(row.index, "back");
              }
            }}
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
                variant="outline"
                onClick={() => {
                  setEditingRowIndex(row.index);
                  setEditFocusField(null);
                  setEditDialogOpen(true);
                }}
              >
                Düzenle
              </Button>
              <Button
                onClick={() => {
                  saveToDB(row.original);
                  setPreviewCards((d) => {
                    d.splice(row.index, 1);
                  });
                }}
                size={"sm"}
              >
                Kaydet
              </Button>
              <Button
                onClick={() => {
                  setPreviewCards((d) => {
                    d.splice(row.index, 1);
                  });
                }}
                variant={"destructive"}
                size={"sm"}
              >
                Sil
              </Button>
            </div>
          );
        },
      },
    ],
    [setPreviewCards, saveToDB],
  );

  const table = useReactTable({
    data: previewCards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const EditCardComponent = () => {
    if (editingRowIndex === null || editingRowIndex >= previewCards.length) {
      return null;
    }

    const card = previewCards[editingRowIndex];
    const [frontContent, setFrontContent] = useState(card.front || "");
    const [backContent, setBackContent] = useState(
      // @ts-ignore
      card.back || "",
    );

    const frontRef = useRef<HTMLTextAreaElement>(null);
    const backRef = useRef<HTMLTextAreaElement>(null);

    // Reset content when dialog opens or card changes
    useEffect(() => {
      if (editDialogOpen) {
        setFrontContent(card.front || "");
        if (card.type !== "Cloze") setBackContent(card.back || "");
      }
    }, [editDialogOpen, card]);

    // Focus the appropriate field when the dialog opens
    useEffect(() => {
      if (editDialogOpen && editFocusField) {
        setTimeout(() => {
          if (editFocusField === "front" && frontRef.current) {
            frontRef.current.focus();
            frontRef.current.setSelectionRange(
              0,
              frontRef.current.value.length,
            );
          } else if (editFocusField === "back" && backRef.current) {
            backRef.current.focus();
            backRef.current.setSelectionRange(0, backRef.current.value.length);
          }
        }, 50); // Small delay to ensure component is mounted
      }
    }, [editDialogOpen, editFocusField]);

    const handleSave = () => {
      setPreviewCards((cards) => {
        if (card.type === "Basic" || card.type === "Type-in") {
          cards[editingRowIndex] = {
            type: card.type,
            front: frontContent,
            back: backContent,
          };
        }

        if (card.type === "Cloze") {
          cards[editingRowIndex] = {
            ...cards[editingRowIndex],
            front: frontContent,
          };
        }
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
            {(card.type === "Basic" || card.type === "Type-in") && (
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader>
          <DialogTitle>Kartları incele ve depoya ekle</DialogTitle>
          <DialogDescription>
            Kartları burdan onaylayıp kaydet
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border max-w-full overflow-x-scroll">
          <Datatable isLoading={false} table={table} columns={columns} />
        </div>
        <TableNav table={table} />
        <EditCardComponent />
      </DialogContent>
    </Dialog>
  );
}

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
const allCardsColumns: ColumnDef<AnkiCard>[] = [
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
        return <RenderTooltipContent content={row.original.value.front} />;
      }

      if (row.original.value.type === "Cloze") {
        return (
          <RenderTooltipContent
            content={renderStringWithHighlight(row.original.value.front)}
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
    cell: ({
      row: {
        original: { value },
      },
    }) => (
      <RenderTooltipContent
        content={
          value.type === "Basic" || value.type === "Type-in" ? value.back : ""
        }
      />
    ),
  },
  {
    header: "Aksiyonlar",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
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
];

export function AllCards() {
  "use no memo";
  const dbCards = useLiveQuery(() => db.cards.reverse().toArray());

  const table = useReactTable({
    data: dbCards ?? [],
    columns: allCardsColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant={"cyan"}>
          Bütün kartlar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader>
          <DialogTitle>Depodaki tüm kartlar</DialogTitle>
          <DialogDescription>Bütün Kartların</DialogDescription>
        </DialogHeader>
        <div className="rounded-md border max-w-full overflow-x-scroll">
          <Datatable
            isLoading={false}
            table={table}
            columns={allCardsColumns}
          />
        </div>
        <TableNav table={table} />
      </DialogContent>
    </Dialog>
  );
}
