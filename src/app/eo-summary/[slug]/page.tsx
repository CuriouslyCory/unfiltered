import type { Metadata, ResolvingMetadata } from "next";
import { api } from "~/trpc/server";
import { toTitleCase } from "~/lib/utils";
import { ArtifactSection } from "./_components/artifact-section";
import { artifactOrder, getArtifactByTitle } from "~/lib/document-utils";
import { DetailsPane } from "./_components/details-pane";
import SummarySection from "./_components/summary-section";
import UpdatesSection from "./_components/updates-section";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug;
  const document = await api.document.getBySlug({ slug });

  return {
    title: document?.title,
    description: `Analysis of ${document?.title}. ${document?.shortSummary}`,
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
  const { slug } = await params;
  const { sections } = await searchParams;
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
  const openSections = typeof sections === "string" ? sections.split(",") : [];
  const updates = getArtifactByTitle(document, "Updates");

  return (
    <article className="">
      <h1 className="mb-6 text-2xl font-bold">
        {toTitleCase(document?.title)}
      </h1>
      <section className="mb-12 flex flex-col gap-x-6 gap-y-6 md:flex-row">
        <DetailsPane document={document} />
        <SummarySection document={document} />
      </section>
      {updates && <UpdatesSection updates={updates} />}
      <div className="flex flex-col gap-y-6">
        {artifactOrder
          .map((title) => getArtifactByTitle(document, title))
          .filter((artifact) => artifact !== undefined)
          .map((artifact) => (
            <ArtifactSection
              key={artifact.id}
              artifact={artifact}
              isOpen={openSections.includes(artifact.title)}
            />
          ))}
      </div>
    </article>
  );
}
