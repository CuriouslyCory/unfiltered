import { type Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/app/_components/ui/accordion";
import { Button } from "~/app/_components/ui/button";
import { CoffeeIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Slak.me and our mission.",
};

type FAQItem = {
  question: string | ReactNode;
  answer: string | ReactNode;
};

const faqItems: FAQItem[] = [
  {
    question: "What is Slak.me?",
    answer:
      "Slak.me is a platform dedicated to providing clear, comprehensive, and unbiased analysis of executive orders and bills coming from the White House. Our mission is to help citizens understand the implications of these important governmental actions by breaking down complex legal documents into clear, actionable insights.",
  },
  {
    question: "How is the data gathered?",
    answer:
      "We collect data directly from official government sources, including the White House website, Congress.gov, and other authoritative sources. Our team uses AI-assisted tools to help process and analyze the large volume of information, but all final analyses are human-reviewed for accuracy and clarity.",
  },
  {
    question: "What data are you including right now?",
    answer: (
      <ul className="list-inside list-disc space-y-2">
        <li>Executive Orders</li>
        <li>Key Legislation</li>
        <li className="text-muted-foreground">
          (Coming Soon) Federal Legislation
        </li>
        <li className="text-muted-foreground">
          (Coming Soon) State Legislation
        </li>
      </ul>
    ),
  },
  {
    question: "What are executive orders?",
    answer:
      "Executive orders are official directives issued by the President of the United States to federal administrative agencies. These orders have the force of law and are used to direct federal agencies and officials in their execution of congressionally established laws or policies. While they don't require congressional approval, executive orders are subject to judicial review and can be overturned if they exceed the President's constitutional powers.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can create an issue on our GitHub repository or by sending an email to cory@curiouslycory.com. We welcome feedback, suggestions, and questions about our analyses.",
  },
  {
    question: "How can I support Slak.me?",
    answer: (
      <div className="space-y-4">
        <p>There are several ways you can support Slak.me:</p>
        <div className="space-y-2">
          <h3 className="font-semibold">Donations</h3>
          <p>
            As a non-profit project, we rely on donations to keep our services
            running. You can support us by:
          </p>
          <Link href="https://buymeacoffee.com/curiouslycory">
            <Button className="flex items-center gap-x-2 font-bold">
              <CoffeeIcon className="h-6 w-6" /> Buy me a coffee
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Collaborators</h3>
          <p>I&apos;m always looking for contributors who can help with:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Content analysis and writing</li>
            <li>Legal expertise</li>
            <li>Research and fact-checking</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    question: "What is the Risk Score?",
    answer:
      "The Risk Score is a measure of how well the executive order aligns with the Constitution. It is calculated based on the order's compliance with the Constitution and the extent to which it exceeds the President's constitutional powers.",
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto w-full min-w-[min(100%,48rem)] max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h1>
      <div className="w-full min-w-[min(100%,48rem)]">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-0"
        >
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="w-full">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
