import { db } from "~/server/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "../../_components/document-editor";
import { api } from "~/trpc/server";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { toTitleCase } from "~/lib/utils";
import { DocumentType } from "~/generated/prisma/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AdjacentDocs = Awaited<
  ReturnType<typeof api.document.getAdminAdjacentDocuments>
>;

const validSortColumns = new Set(["id", "title", "createdAt", "updatedAt"]);
const validRiskLevels = new Set([
  "low",
  "moderate",
  "elevated",
  "high",
  "severe",
]);

function getStringParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function buildQueryString(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of ["sort", "order", "search", "type", "risk"]) {
    const val = getStringParam(searchParams[key]);
    if (val) params.set(key, val);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default async function DocumentEditorPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const documentId = parseInt(id);

  if (isNaN(documentId)) {
    notFound();
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
    include: {
      documentArtifact: true,
    },
  });

  if (!document) {
    notFound();
  }

  // Parse sort/filter params for adjacent document navigation
  const sortParam = getStringParam(resolvedSearchParams.sort);
  const orderParam = getStringParam(resolvedSearchParams.order);
  const searchParam = getStringParam(resolvedSearchParams.search);
  const typeParam = getStringParam(resolvedSearchParams.type);
  const riskParam = getStringParam(resolvedSearchParams.risk);

  const adjacentDocs = await api.document.getAdminAdjacentDocuments({
    currentId: documentId,
    sort:
      sortParam && validSortColumns.has(sortParam)
        ? (sortParam as "id" | "title" | "createdAt" | "updatedAt")
        : undefined,
    order:
      orderParam === "asc" || orderParam === "desc" ? orderParam : undefined,
    search: searchParam || undefined,
    type:
      typeParam && typeParam in DocumentType
        ? (typeParam as keyof typeof DocumentType)
        : undefined,
    risk:
      riskParam && validRiskLevels.has(riskParam)
        ? (riskParam as "low" | "moderate" | "elevated" | "high" | "severe")
        : undefined,
  });

  const queryString = buildQueryString(resolvedSearchParams);

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        <Link
          href={`/admin/documents${queryString}`}
          className="mb-2 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Documents
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{document.title}</h1>
        </div>
      </div>
      <AdjacentDocs adjacentDocs={adjacentDocs} queryString={queryString} />
      <DocumentEditor document={document} />
      <AdjacentDocs adjacentDocs={adjacentDocs} queryString={queryString} />
    </main>
  );
}

function AdjacentDocs({
  adjacentDocs,
  queryString,
}: {
  adjacentDocs: AdjacentDocs;
  queryString: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-x-4">
      {adjacentDocs.previous && (
        <Link
          href={`/admin/documents/${adjacentDocs.previous.id}${queryString}`}
          className="group flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>
            <span className="block text-xs text-gray-400 group-hover:text-gray-600">
              Previous
            </span>
            {toTitleCase(adjacentDocs.previous.title)}
          </span>
        </Link>
      )}
      {adjacentDocs.next && (
        <Link
          href={`/admin/documents/${adjacentDocs.next.id}${queryString}`}
          className="group flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="text-right">
            <span className="block text-xs text-gray-400 group-hover:text-gray-600">
              Next
            </span>
            {toTitleCase(adjacentDocs.next.title)}
          </span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
