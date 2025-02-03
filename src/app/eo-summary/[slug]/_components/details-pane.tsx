import { type Document } from "@prisma/client";
import Link from "next/link";
import { RiskScore } from "~/app/_components/risk-score";

export function DetailsPane({ document }: { document: Document }) {
  return (
    <div className="w-fit min-w-64 rounded-md border bg-card p-6 text-card-foreground dark:border-gray-700">
      <div className="flex flex-col gap-x-2 gap-y-2">
        <div className="flex items-center gap-x-2">
          <span className="text-gray-600 dark:text-gray-400">
            Constitutional Risk:{" "}
          </span>
          <RiskScore score={document?.riskScore} />
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Signed by:</span>{" "}
          <span className="font-bold">{document?.signer}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Signed:</span>{" "}
          <span className="font-bold">
            {document?.dateSigned.toLocaleDateString()}
          </span>
        </div>
        {document?.updatedAt.toISOString() !==
          document?.createdAt.toISOString() && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Last Updated:
            </span>{" "}
            <span className="font-bold">
              {document?.updatedAt.toLocaleDateString()}
            </span>
          </div>
        )}
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
