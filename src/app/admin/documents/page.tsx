import Link from "next/link";
import { Suspense } from "react";

import { api } from "~/trpc/server";
import { adminColumns } from "./columns";
import { AdminDocumentsTable } from "./admin-documents-table";

export default async function DocumentsPage() {
  const documents = await api.document.getAll({ onlyPublished: false });

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

      <Suspense>
        <AdminDocumentsTable columns={adminColumns} data={documents} />
      </Suspense>
    </main>
  );
}
