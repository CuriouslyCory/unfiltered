"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Document } from "~/generated/prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DataTable } from "~/app/_components/document-table/data-table";

const ADMIN_SORT_COLUMNS = new Set(["id", "title", "createdAt", "updatedAt", "riskScore"]);
const ADMIN_DEFAULT_SORT = [{ id: "id" as const, desc: true }];
const FORWARDED_PARAMS = ["sort", "order", "search", "type", "risk", "published"];

interface AdminDocumentsTableProps<TValue> {
  columns: ColumnDef<Document, TValue>[];
  data: Document[];
}

export function AdminDocumentsTable<TValue>({
  columns,
  data,
}: AdminDocumentsTableProps<TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRowClick = useCallback(
    (row: Document) => {
      const params = new URLSearchParams();
      for (const key of FORWARDED_PARAMS) {
        const val = searchParams.get(key);
        if (val) params.set(key, val);
      }
      const qs = params.toString();
      router.push(`/admin/documents/${row.id}${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={handleRowClick}
      validSortColumns={ADMIN_SORT_COLUMNS}
      defaultSort={ADMIN_DEFAULT_SORT}
      showPublishedFilter
    />
  );
}
