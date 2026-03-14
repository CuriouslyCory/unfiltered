import type { Metadata, ResolvingMetadata } from "next";
import { api } from "~/trpc/server";
import { toTitleCase } from "~/lib/utils";
import { artifactOrder, getArtifactByTitle } from "~/lib/document-utils";
import { ArtifactSectionList } from "./_components/artifact-section-list";
import { DetailsPane } from "./_components/details-pane";
import SummarySection from "./_components/summary-section";
import UpdatesSection from "./_components/updates-section";
import { auth } from "~/server/auth";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DocumentBreadcrumbs } from "./_components/breadcrumbs";

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

  const honestTitle = getArtifactByTitle(document, "Honest Title");

  return {
    title: honestTitle?.content ?? document?.title,
    description: `Analysis of ${document?.title}. ${document?.shortSummary}`,
    keywords: document?.slug.replace(/-/g, ", "),
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
  const session = await auth();
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

  const adjacentDocs = await api.document.getAdjacentDocuments({
    currentId: document.id,
  });

  // Get the open sections from URL params
  const openSections = typeof sections === "string" ? sections.split(",") : [];
  const updates = getArtifactByTitle(document, "Updates");
  const honestTitle = getArtifactByTitle(document, "Honest Title");

  return (
    <article className="flex flex-col gap-y-12 pt-6">
      <DocumentBreadcrumbs type={document.type} title={toTitleCase(document.title)} />
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">{toTitleCase(document?.title)}</h1>
        {honestTitle && (
          <div className="flex items-baseline gap-x-2">
            <h4 className="text-sm text-muted-foreground">Honest Title:</h4>
            <h2 className="text-xl font-bold">{honestTitle.content}</h2>
          </div>
        )}
      </div>
      <section className="flex flex-col gap-x-6 gap-y-6 md:flex-row">
        <DetailsPane document={document} />
        <SummarySection document={document} />
      </section>
      {updates && <UpdatesSection updates={updates} />}
      <ArtifactSectionList
        artifacts={artifactOrder
          .map((title) => getArtifactByTitle(document, title))
          .filter((artifact) => artifact !== undefined)}
        initialOpenSections={openSections}
        documentTitle={document.title}
      />
      <div className="mt-8 flex items-center justify-between border-t pt-8">
        {adjacentDocs.previous ? (
          <Link
            href={`/eo-summary/${adjacentDocs.previous.slug}`}
            className="group flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>
              <span className="block text-xs text-muted-foreground group-hover:text-foreground">
                Previous
              </span>
              {toTitleCase(adjacentDocs.previous.title)}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {adjacentDocs.next ? (
          <Link
            href={`/eo-summary/${adjacentDocs.next.slug}`}
            className="group flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="text-right">
              <span className="block text-xs text-muted-foreground group-hover:text-foreground">
                Next
              </span>
              {toTitleCase(adjacentDocs.next.title)}
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
      {session && session.user.isAdmin && (
        <Link href={`/admin/documents/${document.id}`}>
          <span className="text-sm text-muted-foreground">
            Document Id: {document.id}
          </span>
        </Link>
      )}
    </article>
  );
}
