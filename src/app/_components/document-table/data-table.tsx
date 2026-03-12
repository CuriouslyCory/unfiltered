"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { type Document } from "@prisma/client";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";

import { Button } from "~/components/ui/button";

const VALID_SORT_COLUMNS = new Set([
    "dateSigned",
    "riskScore",
    "title",
    "type",
    "updatedAt",
]);

function getSortingFromParams(searchParams: URLSearchParams): SortingState {
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");

    if (sort && VALID_SORT_COLUMNS.has(sort)) {
        return [{ id: sort, desc: order !== "asc" }];
    }

    return [{ id: "dateSigned", desc: true }];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
}

export function DataTable<TValue>({
  columns,
  data,
  pageSize = 20,
}: DataTableProps<Document, TValue>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>(() =>
      getSortingFromParams(searchParams),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Sync sorting state from URL on back/forward navigation
  useEffect(() => {
      const urlSorting = getSortingFromParams(searchParams);
      setSorting(urlSorting);
  }, [searchParams]);

  const handleSortingChange = useCallback(
      (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
          const newSorting =
              typeof updaterOrValue === "function"
                  ? updaterOrValue(sorting)
                  : updaterOrValue;
          setSorting(newSorting); // Optimistic update

          const params = new URLSearchParams(searchParams.toString());
          if (newSorting.length > 0) {
              params.set("sort", newSorting[0]!.id);
              params.set("order", newSorting[0]!.desc ? "desc" : "asc");
          } else {
              params.delete("sort");
              params.delete("order");
          }
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [sorting, searchParams, pathname, router],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter documents..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-200 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === "dateSigned" &&
                        "hidden sm:table-cell",
                      header.column.id === "updatedAt" &&
                        "hidden md:table-cell",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    "transition-colors",
                  )}
                  onClick={() =>
                    router.push(
                      `/eo-summary/${row.original.slug}?sections=ELI5`,
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "dateSigned" &&
                          "hidden sm:table-cell",
                        cell.column.id === "updatedAt" &&
                          "hidden md:table-cell",
                      )}
                    >
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
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
}
