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
import { Datatable } from "@/components/custom-ui/datatable";
import { TableNav } from "@/components/custom-ui/datatable";
import { Updater } from "use-immer";
import { Textarea } from "@/components/ui/textarea";
import { RenderMdWithTooltip } from "@/components/custom-ui/render-md-with-tooltip";

const PREVIEW_PAGE_SIZE = 8;

export function PreviewModal({
  open,
  setOpen,
  previewCards,
  setPreviewCards,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  previewCards: PreviewCard[];
  setPreviewCards: Updater<PreviewCard[]>;
}) {
  // State for the edit dialog
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100vw-32px)] w-[calc(100vw-32px)] h-[calc(100vh-32px)] block space-y-4">
        <DialogHeader className="flex justify-between w-full flex-row pr-8 pt-8">
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
        <Datatable isLoading={false} table={table} columns={columns} />
        <TableNav table={table} />
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
          front: frontContent,
          back: backContent,
          page: card.page,
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
    ],
    [setPreviewCards, inspectRow],
  );

  return columns;
}
