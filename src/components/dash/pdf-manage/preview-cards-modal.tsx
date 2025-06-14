"use no memo";
import { db, PreviewCard } from "@/lib/db";
import {
  useRef,
  useMemo,
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  getOpenDialogCount,
  isAnyDialogOpen,
} from "@/components/ui/dialog";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { Updater } from "use-immer";
import { Textarea } from "@/components/ui/textarea";
import {
  RenderMd,
  RenderMdWithTooltip,
} from "@/components/custom-ui/render-md-with-tooltip";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useHotkeys } from "react-hotkeys-hook";

const PREVIEW_PAGE_SIZE = 8;

export function PreviewModal({
  previewCards,
  setPreviewCards,
}: {
  previewCards: PreviewCard[];
  setPreviewCards: Updater<PreviewCard[]>;
}) {
  // State for the edit dialog
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  const inspectRow = useCallback(
    (rowIndex: number) => {
      setEditingRowIndex(rowIndex);
      setEditDialogOpen(true);
    },
    [setEditingRowIndex, setEditDialogOpen],
  );

  const columns = useColumns({
    setPreviewCards,
    inspectRow,
  });

  const table = useReactTable({
    data: previewCards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: PREVIEW_PAGE_SIZE,
      },
      sorting: [
        {
          id: "page",
          desc: false,
        },
      ],
    },
  });

  useHotkeys("p", () => {
    if (!isAnyDialogOpen()) setOpen(true);
  });

  useHotkeys("d", () => {
    if (getOpenDialogCount() !== 1 || !open) return;
    const row = previewCards[0];
    if (!row) return;
    setPreviewCards((d) => {
      d.splice(0, 1);
    });
  });

  useHotkeys("w", () => {
    if (getOpenDialogCount() !== 1 || !open) return;
    const row = previewCards[0];
    if (!row) return;
    saveToDB(row);
    setPreviewCards((d) => {
      d.splice(0, 1);
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="w-full"
          variant={"purple"}
        >
          Open Preview Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader className="flex flex-col md:flex-row justify-between w-full md:pt-8">
          <div className="space-y-4">
            <DialogTitle>Kartları incele ve depoya ekle</DialogTitle>
            <DialogDescription>
              Kartları burdan onaylayıp kaydet. Latex ve bilimsel notasyon
              içerenler satır içeriğinde doğru gözükmeyebilir. Mouse ile
              hoverladığında doğrusunu görebilirsin.
            </DialogDescription>
          </div>
          <Button
            variant={"destructive"}
            onClick={() => {
              setPreviewCards([]);
            }}
          >
            Delete All Cards
          </Button>
        </DialogHeader>
        <Datatable
          isLoading={false}
          table={table}
          columns={columns}
          className="rounded-md border max-w-full overflow-x-scroll min-h-[528px] hidden md:block"
        />
        <TableNav table={table} className="hidden md:block" />
        <div className="space-y-4 md:hidden">
          <MobileCardList
            previewCards={previewCards}
            inspectRow={inspectRow}
            setPreviewCards={setPreviewCards}
          />
        </div>
        {editDialogOpen ? (
          <EditCardComponent
            editDialogOpen={editDialogOpen}
            setEditDialogOpen={setEditDialogOpen}
            editingRowIndex={editingRowIndex}
            previewCards={previewCards}
            setPreviewCards={setPreviewCards}
          />
        ) : undefined}
      </DialogContent>
    </Dialog>
  );
}

const MobileCardList = ({
  previewCards,
  inspectRow,
  setPreviewCards,
}: {
  previewCards: PreviewCard[];
  inspectRow: (rowIndex: number) => void;
  setPreviewCards: Updater<PreviewCard[]>;
}) => {
  const [index, setIndex] = useState(0);
  const currentCard: PreviewCard | undefined = previewCards?.[index];

  if (!currentCard) {
    return (
      <>
        <Card>Kart Bulunamadı</Card>
        <MobileCardNav array={previewCards} index={index} setIndex={setIndex} />
      </>
    );
  }

  return (
    <>
      <Card>
        <div className="mx-auto px-2 py-4 min-h-96 space-y-4">
          <RenderMd
            content={currentCard.front}
            onDoubleClick={() => inspectRow(index)}
          />
          {currentCard.type !== "Cloze" ? (
            <>
              <Separator />
              <RenderMd
                content={currentCard.back}
                onDoubleClick={() => inspectRow(index)}
              />
            </>
          ) : null}
        </div>
        <CardFooter className="justify-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              inspectRow(index);
            }}
            className="w-full"
          >
            Düzenle
          </Button>
          <Button
            onClick={() => {
              if (!currentCard) return;
              saveToDB(currentCard);
              setPreviewCards((d) => {
                d.splice(index, 1);
              });
            }}
            variant="blue"
            size={"sm"}
            className="w-full"
          >
            Kaydet
          </Button>
          <Button
            onClick={() => {
              setPreviewCards((d) => {
                d.splice(index, 1);
              });
            }}
            variant={"destructive"}
            size={"sm"}
            className="w-full"
          >
            Sil
          </Button>
        </CardFooter>
      </Card>
      <MobileCardNav array={previewCards} index={index} setIndex={setIndex} />
    </>
  );
};

function EditCardComponent({
  editDialogOpen,
  setEditDialogOpen,
  editingRowIndex,
  previewCards,
  setPreviewCards,
}: {
  editDialogOpen: boolean;
  setEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingRowIndex: number | null;
  previewCards: PreviewCard[];
  setPreviewCards: Updater<PreviewCard[]>;
}) {
  const card = previewCards?.[editingRowIndex ?? 0];
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
  }, [editDialogOpen, card, editingRowIndex]);

  // turning this to useCallback breaks idk why
  const handleSave = () => {
    if (editingRowIndex === null || editingRowIndex >= previewCards.length) {
      return null;
    }
    setPreviewCards((cards) => {
      if (card.type === "Basic" || card.type === "Type-in") {
        cards[editingRowIndex] = {
          type: card.type,
          page: card.page,
          fromPage: card.fromPage,
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

  if (editingRowIndex === null || editingRowIndex >= previewCards.length) {
    return null;
  }

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
}

const saveToDB = (card: PreviewCard) => {
  const { page: _, ...value } = card;
  db.cards.add({
    value,
  });
};

function useColumns({
  setPreviewCards,
  inspectRow,
}: {
  setPreviewCards: Updater<PreviewCard[]>;
  inspectRow: (rowIndex: number) => void;
}) {
  const columns = useMemo<ColumnDef<PreviewCard>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Tür",
      },
      {
        accessorKey: "page",
        header: "Sayfa",
        cell: ({ row }) => {
          return (
            <span>
              {row.original.fromPage
                ? `${row.original.fromPage}-${row.original.page}`
                : row.original.page}
            </span>
          );
        },
      },
      {
        header: "Aksiyonlar",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  inspectRow(row.index);
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
                variant="blue"
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
      {
        header: "Ön-Yüz",
        cell: ({ row }) => {
          if (
            row.original.type === "Basic" ||
            row.original.type === "Type-in"
          ) {
            return (
              <RenderMdWithTooltip
                content={row.original.front}
                onDoubleClick={() => inspectRow(row.index)}
                doTruncate={row.index % PREVIEW_PAGE_SIZE !== 0}
              />
            );
          }

          if (row.original.type === "Cloze") {
            return (
              <RenderMdWithTooltip
                content={row.original.front}
                onDoubleClick={() => inspectRow(row.index)}
                doTruncate={row.index % PREVIEW_PAGE_SIZE !== 0}
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
          <RenderMdWithTooltip
            content={getValue() as string}
            onDoubleClick={() => {
              if (
                row.original.type === "Basic" ||
                row.original.type === "Type-in"
              ) {
                inspectRow(row.index);
              }
            }}
            doTruncate={row.index % PREVIEW_PAGE_SIZE !== 0}
          />
        ),
      },
    ],
    [setPreviewCards, inspectRow],
  );

  return columns;
}
