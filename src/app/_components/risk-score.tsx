"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface RiskScoreProps {
  score: number | null;
  size?: "compact" | "full";
  className?: string;
}

const getColorClass = (score: number) => {
  if (score <= 2) return "bg-green-500 text-white";
  if (score <= 4) return "bg-yellow-400 text-black";
  if (score <= 6) return "bg-orange-500 text-white";
  if (score <= 8) return "bg-red-500 text-white";
  return "bg-red-600 text-white";
};

const getRiskLabel = (score: number) => {
  if (score <= 2) return "Low";
  if (score <= 4) return "Moderate";
  if (score <= 6) return "Elevated";
  if (score <= 8) return "High";
  return "Severe";
};

const getTooltipText = (score: number) => {
  const label = getRiskLabel(score);
  if (score <= 2)
    return `${label} Risk (${score}/10): This document poses minimal constitutional concerns.`;
  if (score <= 4)
    return `${label} Risk (${score}/10): This document has some areas worth monitoring.`;
  if (score <= 6)
    return `${label} Risk (${score}/10): This document raises notable constitutional questions.`;
  if (score <= 8)
    return `${label} Risk (${score}/10): This document poses significant constitutional concerns.`;
  return `${label} Risk (${score}/10): This document poses critical constitutional threats.`;
};

const getMeterColorClass = (score: number) => {
  if (score <= 2) return "bg-green-500";
  if (score <= 4) return "bg-yellow-400";
  if (score <= 6) return "bg-orange-500";
  if (score <= 8) return "bg-red-500";
  return "bg-red-600";
};

const getRingClass = (score: number) => {
  if (score < 7) return "";
  if (score <= 8) return "ring-2 ring-red-500 ring-offset-2";
  return "ring-2 ring-red-600 ring-offset-2";
};

export function RiskScore({
  score,
  size = "compact",
  className = "",
}: RiskScoreProps) {
  if (score === null || typeof score === "undefined") {
    return (
      <div
        className={`${className} flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground`}
      >
        -
      </div>
    );
  }

  const normalizedScore = Math.max(0, Math.min(10, score));

  if (size === "full") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold ${getMeterColorClass(normalizedScore).replace("bg-", "text-")}`}
              >
                {normalizedScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
            <span className="text-sm font-medium">
              {getRiskLabel(normalizedScore)} Risk
            </span>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${getMeterColorClass(normalizedScore)}`}
                style={{ width: `${(normalizedScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{getTooltipText(normalizedScore)}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getColorClass(normalizedScore)} ${getRingClass(normalizedScore)} ${className}`}
        >
          {normalizedScore}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{getTooltipText(normalizedScore)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
