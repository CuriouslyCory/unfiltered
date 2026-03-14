import { type Document, type DocumentType } from "~/generated/prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RiskScore } from "~/components/risk-score";
import { DocumentTypeBadge } from "~/components/document-type-badge";

type SummarySectionProps = {
  document: Document;
  sectionCount: number;
  documentType: DocumentType;
  riskScore: number | null;
};

export default function SummarySection({
  document,
  sectionCount,
  documentType,
  riskScore,
}: SummarySectionProps) {
  return (
    <section className="flex w-full flex-col">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-lg">{document?.shortSummary}</p>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <RiskScore score={riskScore} />
            <DocumentTypeBadge type={documentType} className="w-auto" />
            <span className="text-sm text-muted-foreground">
              {sectionCount} analysis {sectionCount === 1 ? "section" : "sections"}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
