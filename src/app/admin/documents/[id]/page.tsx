import { db } from "~/server/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "../../_components/document-editor";
import { api } from "~/trpc/server";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { toTitleCase } from "~/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AdjacentDocs = Awaited<
  ReturnType<typeof api.document.getAdjacentDocuments>
>;

export default async function DocumentEditorPage({ params }: Props) {
  const { id } = await params;
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

  const adjacentDocs = await api.document.getAdjacentDocuments({
    currentId: documentId,
  });

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        <Link
          href="/admin/documents"
          className="mb-2 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Documents
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{document.title}</h1>
        </div>
      </div>
      <AdjacentDocs adjacentDocs={adjacentDocs} />
      <DocumentEditor document={document} />
      <AdjacentDocs adjacentDocs={adjacentDocs} />
    </main>
  );
}

function AdjacentDocs({ adjacentDocs }: { adjacentDocs: AdjacentDocs }) {
  return (
    <div className="flex w-full items-center justify-between gap-x-4">
      {adjacentDocs.previous && (
        <Link
          href={`/admin/documents/${adjacentDocs.previous.id}`}
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
          href={`/admin/documents/${adjacentDocs.next.id}`}
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
