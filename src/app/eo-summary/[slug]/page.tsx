import type { Metadata, ResolvingMetadata } from "next";
import { api } from "~/trpc/server";
import { RiskScore } from "~/app/_components/risk-score";
import { toTitleCase } from "~/lib/utils";
import { ArtifactSection } from "./_components/artifact-section";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug;
  const document = await api.document.getBySlug({ slug });

  return {
    title: document?.title,
    description: `Thoughtful Analysis of ${document?.title}`,
    keywords: document?.slug.replace(/-/g, " "),
    creator: "CuriouslyCory",
    openGraph: {
      publishedTime: document?.createdAt.toISOString(),
      modifiedTime: document?.updatedAt.toISOString(),
      type: "article",
      authors: ["CuriouslyCory"],
      tags: document?.slug.split("-"),
    },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const slug = (await params).slug;
  const document = await api.document.getBySlug({ slug });

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-4">
        <h1 className="text-2xl font-bold">404</h1>
        <p className="text-lg">
          Sorry, but it appears this page has moved or does not exist.
        </p>
      </div>
    );
  }

  // Get the open sections from URL params
  const openSections =
    typeof searchParams.sections === "string"
      ? searchParams.sections.split(",")
      : [];

  return (
    <div className="">
      <h1 className="mb-6 text-2xl font-bold">
        {toTitleCase(document?.title)}
      </h1>

      <div className="mb-12 w-fit rounded-md border bg-card p-6 text-card-foreground dark:border-gray-700">
        <div className="flex flex-col gap-x-2 gap-y-2">
          <div className="flex items-center gap-x-2">
            <span className="text-gray-600 dark:text-gray-400">
              Constitutional Risk:{" "}
            </span>
            <RiskScore score={document?.riskScore} />
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Signed by:</span>{" "}
            <span className="font-bold">{document?.signer}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Signed:</span>{" "}
            <span className="font-bold">
              {document?.dateSigned.toLocaleDateString()}
            </span>
          </div>
          {document?.updatedAt.toISOString() !==
            document?.createdAt.toISOString() && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Last Updated:
              </span>{" "}
              <span className="font-bold">
                {document?.updatedAt.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-y-6">
        <section className="flex flex-col">
          <div className="mb-4 flex items-center gap-x-2">
            <h2 className="text-lg font-bold">Summary</h2>
          </div>
          <p className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
            {document?.shortSummary}
          </p>
        </section>

        {document?.documentArtifact?.map((artifact) => (
          <ArtifactSection
            key={artifact.id}
            artifact={artifact}
            isOpen={openSections.includes(artifact.title)}
          />
        ))}
      </div>
    </div>
  );
}
