"use client";

import { api } from "~/trpc/react";
import { DocumentCard } from "~/app/_components/document-card";
import type { DocumentType } from "~/generated/prisma/client";

interface RelatedDocumentsProps {
  documentId: number;
  type: DocumentType;
  riskScore: number;
}

const typeLabels: Record<DocumentType, string> = {
  EXECUTIVE_ORDER: "More Executive Orders",
  FACT_SHEET: "More Fact Sheets",
  REMARKS: "More Remarks",
  LEGISLATION: "More Legislation",
  OTHER: "More Documents",
};

export function RelatedDocuments({
  documentId,
  type,
  riskScore,
}: RelatedDocumentsProps) {
  const { data } = api.document.getRelated.useQuery({
    documentId,
    type,
    riskScore,
  });

  if (!data || data.documents.length === 0) {
    return null;
  }

  const heading =
    data.reason === "type"
      ? typeLabels[type]
      : "Similar Risk Level";

  return (
    <section className="flex flex-col gap-y-4">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </section>
  );
}
