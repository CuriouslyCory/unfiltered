import { type Document } from "@prisma/client";

export default function SummarySection({ document }: { document: Document }) {
  return (
    <section className="flex w-full flex-col">
      <div className="h-full rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-x-2">
          <h2 className="text-lg font-bold">Summary</h2>
        </div>
        <p>{document?.shortSummary}</p>
      </div>
    </section>
  );
}
