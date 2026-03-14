import { type DocumentType } from "~/generated/prisma/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/app/_components/ui/breadcrumb";

const typeLabels: Record<DocumentType, string> = {
  EXECUTIVE_ORDER: "Executive Orders",
  FACT_SHEET: "Fact Sheets",
  REMARKS: "Remarks",
  LEGISLATION: "Legislation",
  OTHER: "Other",
};

function truncateTitle(title: string, maxLength = 60): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength).trimEnd() + "\u2026";
}

export function DocumentBreadcrumbs({
  type,
  title,
}: {
  type: DocumentType;
  title: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{typeLabels[type]}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{truncateTitle(title)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
