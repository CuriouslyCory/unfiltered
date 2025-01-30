import { CoffeeIcon } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { Button } from "../_components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about our mission to provide unbiased analysis of executive orders.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col py-8">
      <h1 className="mb-6 text-3xl font-bold">About Slak.me</h1>

      <section className="space-y-4 rounded-md border bg-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
        <p>
          Slak.me is dedicated to providing clear, comprehensive, and unbiased
          analysis of executive orders and bills coming from the White House.
          Our mission is to help citizens understand the implications of these
          important governmental actions.
        </p>

        <p>Each analysis examines executive orders through multiple lenses:</p>

        <ul className="ml-4 list-inside list-disc space-y-2">
          <li>Constitutional implications and concerns</li>
          <li>Potential legal challenges</li>
          <li>Real-world impacts on citizens</li>
          <li>Historical context and precedents</li>
        </ul>

        <p>
          I believe that an informed citizenry is essential to a functioning
          democracy. By breaking down complex legal documents into clear,
          actionable insights, I aim to help everyone understand how these
          executive actions might affect their lives and communities.
        </p>

        <p>
          My analyses aim to be comprehensive and understandable. The current
          administration is pushing a huge amount of data as a strategy to
          confuse and overwhelm so I believe that using AI tools to help flag
          and identify the most critical information is necessary.
        </p>
        <section className="flex flex-col gap-y-2 rounded-md border border-black p-6 dark:border-white">
          <p>
            Slak.me is free and I am not being paid by anyone. If you find this
            tool useful, please consider buying me a coffee.
          </p>
          <Link href="https://buymeacoffee.com/curiouslycory">
            <Button className="flex items-center gap-x-2 font-bold">
              <CoffeeIcon className="h-6 w-6" /> Buy me a coffee
            </Button>
          </Link>
        </section>
      </section>
    </main>
  );
}
