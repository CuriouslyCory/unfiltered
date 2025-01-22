import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Unfiltered Executive Order Analysis",
  description:
    "Learn about our mission to provide unbiased analysis of executive orders.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col py-8">
      <h1 className="mb-6 text-3xl font-bold">About Unfiltered</h1>

      <section className="space-y-4">
        <p>
          Unfiltered is dedicated to providing clear, comprehensive, and
          unbiased analysis of executive orders and bills coming from the White
          House. Our mission is to help citizens understand the implications of
          these important governmental actions.
        </p>

        <p>Each analysis examines executive orders through multiple lenses:</p>

        <ul className="ml-4 list-inside list-disc space-y-2">
          <li>Constitutional implications and concerns</li>
          <li>Potential legal challenges</li>
          <li>Real-world impacts on citizens</li>
          <li>Historical context and precedents</li>
        </ul>

        <p>
          We believe that an informed citizenry is essential to a functioning
          democracy. By breaking down complex legal documents into clear,
          actionable insights, we aim to help everyone understand how these
          executive actions might affect their lives and communities.
        </p>

        <p>
          Our analyses aim to be comprehensive and understandable. The current
          administration is pushing a huge amount of data as a strategy to
          confuse and overwhelm so we believe that using AI tools to help flag
          and identify the most critical information is necessary.
        </p>
      </section>
    </main>
  );
}
