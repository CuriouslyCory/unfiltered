"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Document } from "~/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DataTable } from "~/app/_components/document-table/data-table";

const ADMIN_SORT_COLUMNS = new Set(["id", "title", "createdAt", "updatedAt"]);
const ADMIN_DEFAULT_SORT = [{ id: "id" as const, desc: true }];

interface AdminDocumentsTableProps<TValue> {
  columns: ColumnDef<Document, TValue>[];
  data: Document[];
}

export function AdminDocumentsTable<TValue>({
  columns,
  data,
}: AdminDocumentsTableProps<TValue>) {
  const router = useRouter();

  const handleRowClick = useCallback(
    (row: Document) => {
      router.push(`/admin/documents/${row.id}`);
    },
    [router],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={handleRowClick}
      validSortColumns={ADMIN_SORT_COLUMNS}
      defaultSort={ADMIN_DEFAULT_SORT}
    />
  );
}
