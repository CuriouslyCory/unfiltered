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
          className="w-full justify-start px-2"
        >
          Date Signed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
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
      return <RiskScore score={row.getValue("riskScore")} />;
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
          className="w-full justify-start px-2"
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
        <div className="text-sm text-muted-foreground">
          {updated.toLocaleDateString()}
        </div>
      );
    },
  },
];
