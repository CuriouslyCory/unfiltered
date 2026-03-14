import { Suspense } from "react";
import { type Metadata } from "next";
import { AlertTriangle } from "lucide-react";
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

        <section className="mb-12">
          <div className="mb-6 flex items-center gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/50">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">High Risk Documents</h2>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {highRiskCount}
                </span>{" "}
                document{highRiskCount === 1 ? "" : "s"} with risk score 5 or
                higher
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highestRiskScoreDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">All Documents</h2>
          <Suspense>
            <DataTable columns={columns} data={documents} />
          </Suspense>
        </section>
      </main>
    </HydrateClient>
  );
}
