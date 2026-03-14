import { FileText, AlertTriangle, CalendarDays } from "lucide-react";
import { DocumentSearch } from "./document-search";
import { StatCard } from "./stat-card";

interface HeroSectionProps {
  totalDocuments: number;
  highRiskCount: number;
  lastUpdated: string;
}

export function HeroSection({
  totalDocuments,
  highRiskCount,
  lastUpdated,
}: HeroSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-6 text-center">
        <h1 className="mb-2 font-serif text-3xl font-bold md:text-4xl">
          Track the Impact of Executive Orders
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Independent analysis of executive orders, legislation, and government
          actions — tracking constitutional risk and civic impact.
        </p>
      </div>

      <div className="mx-auto mb-6 max-w-xl">
        <DocumentSearch />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <StatCard
          icon={FileText}
          value={totalDocuments}
          label="Documents Tracked"
        />
        <StatCard
          icon={AlertTriangle}
          value={highRiskCount}
          label="High Risk (5+)"
        />
        <StatCard
          icon={CalendarDays}
          value={lastUpdated}
          label="Last Updated"
        />
      </div>
    </section>
  );
}
