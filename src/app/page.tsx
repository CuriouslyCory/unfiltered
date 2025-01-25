import Link from "next/link";
import { type Metadata } from "next";
import { api, HydrateClient } from "~/trpc/server";
import Image from "next/image";
import { cn, toTitleCase } from "~/lib/utils";

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
        <div className="mb-12 max-w-prose">
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
        <ul className="list-inside divide-y divide-gray-200 rounded-md border dark:divide-gray-700">
          {documents.map((document, index) => (
            <li
              key={document.id}
              className={cn(
                "p-3",
                index % 2 === 0 ? "" : "bg-gray-200 dark:bg-gray-800",
              )}
            >
              <Link
                href={`/eo-summary/${document.slug}`}
                className="hover:text-blue-500"
              >
                <div className="flex items-center gap-x-2">
                  <span className="text-sm text-gray-500">
                    {document.dateSigned.toLocaleDateString()}
                  </span>
                  <span className="font-bold">
                    {toTitleCase(document.title)}
                    {document.updatedAt.toString() !==
                      document.createdAt.toString() && (
                      <span className="ml-2 text-sm text-green-700 dark:text-green-500">
                        (Updated {document.updatedAt.toLocaleDateString()})
                      </span>
                    )}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </HydrateClient>
  );
}
