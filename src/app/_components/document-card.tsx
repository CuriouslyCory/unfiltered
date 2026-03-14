import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { RiskScore } from "./risk-score";
import { DocumentTypeBadge } from "./document-type-badge";
import { cn } from "~/lib/utils";
import type { Document } from "~/generated/prisma/client";

interface DocumentCardProps {
  document: Document;
  className?: string;
}

function getRiskBorderClass(score: number | null): string {
  if (score === null) return "border-l-muted";
  if (score <= 2) return "border-l-green-500";
  if (score <= 4) return "border-l-yellow-400";
  if (score <= 6) return "border-l-orange-500";
  if (score <= 8) return "border-l-red-500";
  return "border-l-red-600";
}

export function DocumentCard({ document, className }: DocumentCardProps) {
  const dateSigned = document.dateSigned
    ? new Date(document.dateSigned).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link href={`/eo-summary/${document.slug}`}>
      <Card
        className={cn(
          "flex h-full flex-col border-l-4 transition-shadow hover:shadow-md",
          getRiskBorderClass(document.riskScore),
          className,
        )}
      >
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <DocumentTypeBadge type={document.type} className="w-auto" />
            <RiskScore score={document.riskScore} className="flex-shrink-0" />
          </div>
          <CardTitle className="line-clamp-2">{document.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {document.shortSummary && (
            <p className="line-clamp-4 text-sm text-muted-foreground">
              {document.shortSummary}
            </p>
          )}
          {dateSigned && (
            <p className="mt-2 text-xs text-muted-foreground">
              Signed {dateSigned}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
