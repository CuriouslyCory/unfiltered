import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";
import { columns } from "./_components/document-table/columns";
import { DataTable } from "./_components/document-table/data-table";
import { DocumentCard } from "./_components/document-card";

export const metadata: Metadata = {
  title: "Home",
  description: "List of executive orders and bills with critical analysis.",
};

export default async function Home() {
  const documents = await api.document.getAll({});

  const highestRiskScoreDocuments = [...documents]
    .sort((a, b) => (b?.riskScore ?? 0) - (a?.riskScore ?? 0))
    .slice(0, 3);

  const highRiskCount = documents.filter(
    (doc) => (doc?.riskScore ?? 0) >= 5,
  ).length;

  return (
    <HydrateClient>
      <main className="flex flex-col">
        <div className="mb-6">
          <p className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
            There&apos;s a firehose of executive orders and bills coming out of
            the White House. I knew I wouldn&apos;t have time to read them all
            in detail, so I built this tool to help me understand the
            implications of them. If I had this problem, I figured others might
            too.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold">Highest Risk Score</h2>
          <div className="mb-4 rounded-md border bg-yellow-100 p-4 dark:border-yellow-800 dark:bg-yellow-950">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              Currently tracking {highRiskCount} document
              {highRiskCount === 1 ? "" : "s"} with high risk scores (5 or
              higher)
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highestRiskScoreDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={documents} />
      </main>
    </HydrateClient>
  );
}
