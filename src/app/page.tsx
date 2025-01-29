import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";
import { columns } from "./_components/document-table/columns";
import { DataTable } from "./_components/document-table/data-table";

export const metadata: Metadata = {
  title: "Home",
  description: "List of executive orders and bills with critical analysis.",
};

export default async function Home() {
  const documents = await api.document.getAll();

  void api.document.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="flex flex-col">
        <div className="mb-12">
          <h1 className="mb-6 text-2xl font-bold">What is Unfiltered?</h1>
          <p className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
            There&apos;s a firehose of executive orders and bills coming out of
            the White House. I knew I wouldn&apos;t have time to read them all
            in detail, so I built this tool to help me understand the
            implications of them. If I had this problem, I figured others might
            too.
          </p>
        </div>
        <h1 className="mb-6 text-2xl font-bold">Executive Order Analysis</h1>
        <DataTable columns={columns} data={documents} />
      </main>
    </HydrateClient>
  );
}
