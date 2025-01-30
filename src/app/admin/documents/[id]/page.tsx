import { db } from "~/server/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentEditor } from "../../_components/document-editor";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin/documents"
            className="mb-2 inline-block text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Documents
          </Link>
          <h1 className="text-3xl font-bold">{document.title}</h1>
        </div>
      </div>

      <DocumentEditor document={document} />
    </main>
  );
}
