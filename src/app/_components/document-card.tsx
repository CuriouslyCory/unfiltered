import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { RiskScore } from "./risk-score";
import { cn } from "~/lib/utils";
import type { Document } from "@prisma/client";
import { Button } from "./ui/button";

interface DocumentCardProps {
  document: Document;
  className?: string;
}

export function DocumentCard({ document, className }: DocumentCardProps) {
  return (
    <Link href={`/eo-summary/${document.slug}`}>
      <Card
        className={cn(
          "flex h-full flex-col transition-shadow hover:shadow-md",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-x-4">
            <CardTitle className="line-clamp-2 flex-1 text-base">
              {document.title}
            </CardTitle>
            <RiskScore score={document.riskScore} className="flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {document.shortSummary && (
            <p className="line-clamp-4 text-sm text-muted-foreground">
              {document.shortSummary}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex items-end justify-end">
          <Button variant="ghost" className="text-gray-500">
            Read More
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
