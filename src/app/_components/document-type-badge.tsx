import { type DocumentType } from "@prisma/client";
import { type HTMLAttributes } from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const typeConfig: Record<DocumentType, { label: string; className: string }> = {
  EXECUTIVE_ORDER: {
    label: "Executive Order",
    className: "bg-blue-500 hover:bg-blue-600",
  },
  FACT_SHEET: {
    label: "Fact Sheet",
    className: "bg-green-500 hover:bg-green-600",
  },
  REMARKS: {
    label: "Remarks",
    className: "bg-purple-500 hover:bg-purple-600",
  },
  LEGISLATION: {
    label: "Legislation",
    className: "bg-amber-500 hover:bg-amber-600",
  },
  OTHER: {
    label: "Other",
    className: "bg-gray-500 hover:bg-gray-600",
  },
};

export function DocumentTypeBadge({
  type,
  className,
}: {
  type: DocumentType;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}) {
  const config = typeConfig[type];

  return (
    <Badge
      className={cn(
        config.className,
        "center w-full text-nowrap font-medium",
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
