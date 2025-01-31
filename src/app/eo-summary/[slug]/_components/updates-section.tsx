import { type DocumentArtifact } from "@prisma/client";
import Markdown, { type Components } from "react-markdown";
import { markdownComponents } from "~/app/_components/markdown-components";

export default function UpdatesSection({
  updates,
}: {
  updates: DocumentArtifact | undefined;
}) {
  const components: Components = {
    ...markdownComponents,
    ul: (props) => <ul className="mt-2" {...props} />,
    a: (props) => (
      <a
        className="text-indigo-600 hover:underline dark:text-indigo-500/90"
        {...props}
        target="_blank"
      />
    ),
  };

  return (
    <section className="mb-12 flex flex-col rounded-md border bg-white/5 p-6">
      <h2 className="text-lg font-bold">Updates</h2>
      <Markdown components={components}>{updates?.content ?? ""}</Markdown>
    </section>
  );
}
