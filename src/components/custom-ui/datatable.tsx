import type { Table as TableType } from "@tanstack/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Table as TanstackTableType } from "@tanstack/react-table";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  isLoading: boolean;
  table: TableType<any>;
  columns: ColumnDef<any>[];
  className?: string;
}

export const Datatable = ({ isLoading, table, columns, className }: Props) => {
  "use no memo";
  const [loadingSkeletonHeight, setLoadingSkeletonHeight] =
    useState<number>(550);

  const tableRef = useRef<HTMLTableElement>(null);
  const firstLoad = useRef(true);
  const currentPage = table.getState().pagination.pageIndex;

  useEffect(() => {
    if (!tableRef.current) {
      return;
    }
    const h = tableRef.current.clientHeight;

    if (h > 200 && h !== loadingSkeletonHeight) {
      setLoadingSkeletonHeight(h);
    }

    if (currentPage === 0 || firstLoad.current) {
      tableRef.current.style.minHeight = `${h}px`;
      firstLoad.current = false;
    }
  }, [tableRef, isLoading, firstLoad]);

  return (
    <div
      className={cn("rounded-md border max-w-full min-h-[432px]", className)}
      ref={tableRef}
    >
      {isLoading ? (
        <Skeleton
          className="h-[550px] w-full"
          style={{ minHeight: `${loadingSkeletonHeight}px` }}
        />
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="text-nowrap">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export const TableNav = ({
  table,
  className,
}: {
  table: TanstackTableType<any>;
  className?: string;
}) => {
  const { pagination } = table.getState();
  const maxPage = Math.ceil(table.getRowCount() / pagination.pageSize);
  return (
    <div className={"flex justify-center sm:justify-end " + className}>
      <div className="mt-4 flex items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Popover>
          <PopoverTrigger>
            <span className="text-light align-middle text-sm text-bw-600">
              {`Sayfa ${pagination.pageIndex + 1} / ${
                table.getRowCount() ? maxPage : 1
              }`}
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
                    const page = Number(inputValue) - 1;
                    if (page < maxPage) {
                      table.setPageIndex(page);
                    } else {
                      toast.error("Can't find the page", {
                        description: `The input page cant be bigger than ${maxPage}.`,
                        duration: 2500,
                      });
                    }
                  }
                }
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export const MobileCardNav = <T extends any[]>({
  array,
  index,
  setIndex,
  className,
}: {
  array: T;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  className?: string;
}) => {
  const maxPage = array.length;
  return (
    <div className={cn("flex justify-center sm:justify-end", className)}>
      <div className="mt-4 flex items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex((e) => e - 1)}
          disabled={index === 0}
        >
          Previous
        </Button>
        <Popover>
          <PopoverTrigger>
            <span className="text-light align-middle text-sm text-bw-600">
              {`Sayfa ${index + 1} / ${maxPage}`}
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
                    const page = Number(inputValue) - 1;
                    if (page < maxPage) {
                      setIndex(page);
                    } else {
                      toast.error("Can't find the page", {
                        description: `The input page cant be bigger than ${maxPage}.`,
                        duration: 2500,
                      });
                    }
                  }
                }
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex((e) => e + 1)}
          disabled={index === maxPage - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
