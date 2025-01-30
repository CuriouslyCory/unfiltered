import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find ways to contact Slak.me and learn more about the team behind the project.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col py-8">
      <h1 className="mb-6 text-3xl font-bold">Contact Slak.me</h1>
      <section className="flex flex-col gap-y-2">
        <p>
          If you have any questions or feedback, please feel free to contact us.
        </p>
      </section>
      <Link href="https://github.com/CuriouslyCory/unfiltered">Github</Link>
    </main>
  );
}
