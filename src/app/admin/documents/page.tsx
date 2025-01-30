import Link from "next/link";
import { db } from "~/server/db";

export default async function DocumentsPage() {
  const documents = await db.document.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      riskScore: true,
    },
  });

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <Link
          href="/admin"
          className="rounded-lg bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
        >
          Back to Admin
        </Link>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/admin/documents/${doc.id}`}
            className="flex items-center justify-between rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div>
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p className="text-sm text-gray-400">
                Last updated: {doc.updatedAt.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded bg-white/10 px-2 py-1 text-sm">
                Risk: {doc.riskScore ?? "N/A"}
              </span>
              <span className="text-blue-400">Edit →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
