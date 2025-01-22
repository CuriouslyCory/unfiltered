import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Unfiltered Executive Order Analysis",
  description: "List of executive orders and bills with critical analysis.",
};

export default async function Home() {
  // Read the articles directory
  const articlesDirectory = path.join(
    process.cwd(),
    "src/app/eo-summary/_articles",
  );
  const files = await fs.readdir(articlesDirectory);

  // Filter for .mdx files and format titles
  const articles = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(".mdx", ""),
      title: file
        .replace(".mdx", "")
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));

  return (
    <main className="flex flex-col">
      <div className="mb-12">
        <h1 className="mb-6 text-2xl font-bold">About</h1>
        <p>
          Unfiltered aims to be a resource for those who want to understand the
          implications of executive orders and bills coming out of the White
          House.
        </p>
      </div>
      <h1 className="mb-6 text-2xl font-bold">Executive Order Summaries</h1>
      <ul className="list-inside space-y-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/eo-summary/${article.slug}`}
              className="hover:text-blue-500"
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
