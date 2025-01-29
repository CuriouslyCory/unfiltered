"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Document } from "@prisma/client";
import { RiskScore } from "../risk-score";
import { toTitleCase } from "~/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "dateSigned",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden w-full justify-start px-2 sm:flex"
        >
          Date Signed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="hidden text-center text-sm text-muted-foreground sm:block">
          {row.getValue<Date>("dateSigned").toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "riskScore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-start px-2"
        >
          Risk
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <RiskScore score={row.getValue("riskScore")} />
        </div>
      );
    },
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
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden w-full justify-start px-2 md:flex"
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const updated = row.getValue<Date>("updatedAt");
      const created = row.original.createdAt;
      if (updated.toString() === created.toString()) return null;

      return (
        <div className="hidden text-center text-sm text-muted-foreground md:block">
          {updated.toLocaleDateString()}
        </div>
      );
    },
  },
];
