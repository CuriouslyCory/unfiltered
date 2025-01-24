import Link from "next/link";
import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";

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
          <h1 className="mb-6 text-2xl font-bold">About</h1>
          <p>
            Unfiltered aims to be a resource for those who want to understand
            the implications of executive orders and bills coming out of the
            White House.
          </p>
        </div>
        <h1 className="mb-6 text-2xl font-bold">Executive Order Summaries</h1>
        <ul className="list-inside space-y-2">
          {documents.map((document) => (
            <li key={document.id}>
              <Link
                href={`/eo-summary/${document.slug}`}
                className="hover:text-blue-500"
              >
                <div className="flex items-center gap-x-2">
                  <span className="text-sm text-gray-500">
                    {document.dateSigned.toLocaleDateString()}
                  </span>
                  <span className="font-bold">{document.title}</span>
                  {document.updatedAt.toString() !==
                    document.createdAt.toString() && (
                    <span className="text-sm text-green-700 dark:text-green-500">
                      (Updated {document.updatedAt.toLocaleDateString()})
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </HydrateClient>
  );
}
