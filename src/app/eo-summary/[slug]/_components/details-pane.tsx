import { type Document } from "~/generated/prisma/client";
import Link from "next/link";
import { DocumentTypeBadge } from "~/app/_components/document-type-badge";
import { RiskScore } from "~/app/_components/risk-score";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";

export function DetailsPane({ document }: { document: Document }) {
  return (
    <Card className="w-fit min-w-64">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Document Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div>
          <span className="text-sm text-muted-foreground">
            Constitutional Risk
          </span>
          <div className="mt-1">
            <RiskScore score={document?.riskScore} size="full" />
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-2">
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
              <span className="text-muted-foreground">Last Updated:</span>{" "}
              <span className="font-bold">
                {document?.updatedAt.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-2">
          {document.type && (
            <DocumentTypeBadge type={document.type} className="w-auto" />
          )}
          {document?.originalDocumentUrl && (
            <Link
              href={document?.originalDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              View Original
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
