"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Document } from "@prisma/client";
import { toTitleCase } from "~/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";

export const adminColumns: ColumnDef<Document>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-2"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">{row.getValue<number>("id")}</div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-2"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium">{toTitleCase(row.getValue("title"))}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden w-full justify-start px-2 sm:flex"
        >
          Date Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="hidden text-center text-sm text-muted-foreground sm:block">
        {row.getValue<Date>("createdAt").toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden w-full justify-start px-2 md:flex"
        >
          Date Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="hidden text-center text-sm text-muted-foreground md:block">
        {row.getValue<Date>("updatedAt").toLocaleDateString()}
      </div>
    ),
  },
];
