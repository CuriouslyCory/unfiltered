import { type Document } from "~/generated/prisma/client";
import Link from "next/link";
import { DocumentTypeBadge } from "~/app/_components/document-type-badge";
import { RiskScore } from "~/app/_components/risk-score";

export function DetailsPane({ document }: { document: Document }) {
  return (
    <div className="w-fit min-w-64 rounded-md border border-border bg-card p-6 text-card-foreground">
      <div className="flex flex-col gap-x-2 gap-y-2">
        <div className="flex items-center gap-x-2">
          <span className="text-muted-foreground">
            Constitutional Risk:{" "}
          </span>
          <RiskScore score={document?.riskScore} />
        </div>
        <div>
          <span className="text-muted-foreground">Signed by:</span>{" "}
          <span className="font-bold">{document?.signer}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Signed:</span>{" "}
          <span className="font-bold">
            {document?.dateSigned.toLocaleDateString()}
          </span>
        </div>
        {document?.updatedAt.toISOString() !==
          document?.createdAt.toISOString() && (
          <div>
            <span className="text-muted-foreground">
              Last Updated:
            </span>{" "}
            <span className="font-bold">
              {document?.updatedAt.toLocaleDateString()}
            </span>
          </div>
        )}
        {document.type && <DocumentTypeBadge type={document.type} />}
        {document?.originalDocumentUrl && (
          <div>
            <Link
              href={document?.originalDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              View Original
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
