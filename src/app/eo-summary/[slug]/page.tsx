import { ChevronsUpDown } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata, ResolvingMetadata } from "next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { api } from "~/trpc/server";
import { RiskScore } from "~/app/_components/risk-score";
import { toTitleCase } from "~/lib/utils";

// markdown overrides
const components: Components = {
  li: (props) => <li className="mb-4" {...props} />,
  ul: (props) => <ul className="mb-2 list-inside list-disc" {...props} />,
  h1: (props) => <h1 className="my-4 text-2xl font-bold" {...props} />,
  h2: (props) => <h2 className="my-4 text-xl font-bold" {...props} />,
  h3: (props) => <h3 className="my-4 text-lg font-bold" {...props} />,
  h4: (props) => <h4 className="my-4 text-base font-bold" {...props} />,
  p: (props) => <p className="my-4" {...props} />,
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const slug = (await params).slug;

  // fetch data
  const document = await api.document.getBySlug({ slug });

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images ?? [];

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

export default async function Page({ params }: Props) {
  const slug = (await params).slug;

  const document = await api.document.getBySlug({ slug });

  void api.document.getBySlug.prefetch({ slug });

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
          <Collapsible key={artifact.id}>
            <CollapsibleTrigger>
              <div className="mb-4 flex items-center gap-x-2">
                <ChevronsUpDown className="h-4 w-4" />
                <h2 className="text-lg font-bold">{artifact.title}</h2>
                <span className="text-gray-600 dark:text-gray-400">
                  (Click to expand)
                </span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <div className="rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
                <Markdown remarkPlugins={[remarkGfm]} components={components}>
                  {artifact.content}
                </Markdown>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
