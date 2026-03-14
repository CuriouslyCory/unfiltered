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
  type FilterFn,
} from "@tanstack/react-table";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { type Document } from "~/generated/prisma/client";
import { RISK_RANGES } from "~/lib/document-utils";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";

import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";

const riskRangeFilter: FilterFn<Document> = (row, columnId, filterValue: string) => {
  const range = RISK_RANGES[filterValue];
  if (!range) return true;
  const score = (row.getValue(columnId) as number) ?? 0;
  return score >= range[0] && score <= range[1];
};

const DEFAULT_VALID_SORT_COLUMNS = new Set([
    "dateSigned",
    "riskScore",
    "title",
    "type",
    "updatedAt",
]);

const DEFAULT_SORT: SortingState = [{ id: "dateSigned", desc: true }];

function getPageIndexFromParams(searchParams: URLSearchParams): number {
    const page = searchParams.get("page");
    if (!page) return 0;
    const parsed = parseInt(page, 10);
    if (isNaN(parsed) || parsed < 1) return 0;
    return parsed - 1; // URL is 1-indexed, table is 0-indexed
}

function getSortingFromParams(
    searchParams: URLSearchParams,
    validColumns: Set<string>,
    defaultSort: SortingState,
): SortingState {
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");

    if (sort && validColumns.has(sort)) {
        return [{ id: sort, desc: order !== "asc" }];
    }

    return defaultSort;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: Document) => void;
  validSortColumns?: Set<string>;
  defaultSort?: SortingState;
}

export function DataTable<TValue>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  validSortColumns = DEFAULT_VALID_SORT_COLUMNS,
  defaultSort = DEFAULT_SORT,
}: DataTableProps<Document, TValue>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>(() =>
      getSortingFromParams(searchParams, validSortColumns, defaultSort),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
      const filters: ColumnFiltersState = [];
      const search = searchParams.get("search");
      if (search) filters.push({ id: "title", value: search });
      const type = searchParams.get("type");
      if (type) filters.push({ id: "type", value: type });
      const risk = searchParams.get("risk");
      if (risk) filters.push({ id: "riskScore", value: risk });
      return filters;
  });
  const [searchValue, setSearchValue] = useState(
      () => searchParams.get("search") ?? "",
  );
  const [typeFilter, setTypeFilter] = useState(
      () => searchParams.get("type") ?? "",
  );
  const [riskFilter, setRiskFilter] = useState(
      () => searchParams.get("risk") ?? "",
  );
  const [pageIndex, setPageIndex] = useState(() =>
      getPageIndexFromParams(searchParams),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync sorting, search, filters, and pagination state from URL on back/forward navigation
  useEffect(() => {
      const urlSorting = getSortingFromParams(searchParams, validSortColumns, defaultSort);
      setSorting(urlSorting);

      const urlSearch = searchParams.get("search") ?? "";
      setSearchValue(urlSearch);

      const urlType = searchParams.get("type") ?? "";
      setTypeFilter(urlType);

      const urlRisk = searchParams.get("risk") ?? "";
      setRiskFilter(urlRisk);

      const filters: ColumnFiltersState = [];
      if (urlSearch) filters.push({ id: "title", value: urlSearch });
      if (urlType) filters.push({ id: "type", value: urlType });
      if (urlRisk) filters.push({ id: "riskScore", value: urlRisk });
      setColumnFilters(filters);

      const urlPageIndex = getPageIndexFromParams(searchParams);
      const maxPage = Math.max(0, Math.ceil(data.length / pageSize) - 1);
      setPageIndex(Math.min(urlPageIndex, maxPage));
  }, [searchParams, data.length, pageSize]);

  const handleSortingChange = useCallback(
      (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
          const newSorting =
              typeof updaterOrValue === "function"
                  ? updaterOrValue(sorting)
                  : updaterOrValue;
          setSorting(newSorting); // Optimistic update
          setPageIndex(0); // Reset page on sort change

          const params = new URLSearchParams(searchParams.toString());
          if (newSorting.length > 0) {
              params.set("sort", newSorting[0]!.id);
              params.set("order", newSorting[0]!.desc ? "desc" : "asc");
          } else {
              params.delete("sort");
              params.delete("order");
          }
          params.delete("page"); // Reset page on sort change
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [sorting, searchParams, pathname, router],
  );

  const pushSearchToUrl = useCallback(
      (value: string) => {
          const params = new URLSearchParams(searchParams.toString());
          if (value) {
              params.set("search", value);
          } else {
              params.delete("search");
          }
          params.delete("page"); // Reset page on search change
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [searchParams, pathname, router],
  );

  const handleSearchChange = useCallback(
      (value: string) => {
          setSearchValue(value); // Optimistic update
          setPageIndex(0); // Reset page on search change
          // Apply filter immediately for responsive UI
          if (value) {
              setColumnFilters((prev) => {
                  const other = prev.filter((f) => f.id !== "title");
                  return [...other, { id: "title", value }];
              });
          } else {
              setColumnFilters((prev) => prev.filter((f) => f.id !== "title"));
          }

          // Debounce URL update
          if (debounceRef.current) {
              clearTimeout(debounceRef.current);
          }
          debounceRef.current = setTimeout(() => {
              pushSearchToUrl(value);
          }, 300);
      },
      [pushSearchToUrl],
  );

  const handleTypeFilterChange = useCallback(
      (value: string) => {
          const filterValue = value === "all" ? "" : value;
          setTypeFilter(filterValue);
          setPageIndex(0);
          setColumnFilters((prev) => {
              const other = prev.filter((f) => f.id !== "type");
              return filterValue ? [...other, { id: "type", value: filterValue }] : other;
          });

          const params = new URLSearchParams(searchParams.toString());
          if (filterValue) {
              params.set("type", filterValue);
          } else {
              params.delete("type");
          }
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [searchParams, pathname, router],
  );

  const handleRiskFilterChange = useCallback(
      (value: string) => {
          const filterValue = value === "all" ? "" : value;
          setRiskFilter(filterValue);
          setPageIndex(0);
          setColumnFilters((prev) => {
              const other = prev.filter((f) => f.id !== "riskScore");
              return filterValue ? [...other, { id: "riskScore", value: filterValue }] : other;
          });

          const params = new URLSearchParams(searchParams.toString());
          if (filterValue) {
              params.set("risk", filterValue);
          } else {
              params.delete("risk");
          }
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [searchParams, pathname, router],
  );

  const handlePageChange = useCallback(
      (newPageIndex: number) => {
          setPageIndex(newPageIndex); // Optimistic update

          const params = new URLSearchParams(searchParams.toString());
          if (newPageIndex === 0) {
              params.delete("page"); // Page 1 omits param for clean URLs
          } else {
              params.set("page", String(newPageIndex + 1)); // 1-indexed in URL
          }
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
      },
      [searchParams, pathname, router],
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      riskRange: riskRangeFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
        setColumnFilters((prev) =>
            typeof updater === "function" ? updater(prev) : updater,
        );
    },
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
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter documents..."
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter || "all"} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="EXECUTIVE_ORDER">Executive Order</SelectItem>
            <SelectItem value="FACT_SHEET">Fact Sheet</SelectItem>
            <SelectItem value="REMARKS">Remarks</SelectItem>
            <SelectItem value="LEGISLATION">Legislation</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter || "all"} onValueChange={handleRiskFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Risk Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low (0-2)</SelectItem>
            <SelectItem value="moderate">Moderate (3-4)</SelectItem>
            <SelectItem value="elevated">Elevated (5-6)</SelectItem>
            <SelectItem value="high">High (7-8)</SelectItem>
            <SelectItem value="severe">Severe (9-10)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
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
                    "even:bg-muted/30",
                  )}
                  onClick={() =>
                    onRowClick
                      ? onRowClick(row.original)
                      : router.push(
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
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} documents
        </p>
        <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
        </div>
      </div>
    </div>
  );
}
