import { Suspense } from "react";
import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";
import { columns } from "./_components/document-table/columns";
import { DataTable } from "./_components/document-table/data-table";
import { DocumentCard } from "./_components/document-card";
import { HeroSection } from "./_components/hero-section";

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

  const mostRecentDate = documents.reduce<Date | null>((latest, doc) => {
    const date = doc.dateSigned ?? doc.createdAt;
    if (!date) return latest;
    if (!latest || date > latest) return date;
    return latest;
  }, null);

  const lastUpdated = mostRecentDate
    ? mostRecentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <HydrateClient>
      <main className="flex flex-col">
        <HeroSection
          totalDocuments={documents.length}
          highRiskCount={highRiskCount}
          lastUpdated={lastUpdated}
        />

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

        <Suspense>
          <DataTable columns={columns} data={documents} />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
