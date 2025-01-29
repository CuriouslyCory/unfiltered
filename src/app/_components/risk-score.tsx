interface RiskScoreProps {
  score: number | null;
  className?: string;
}

export function RiskScore({ score, className = "" }: RiskScoreProps) {
  if (!score) {
    return <span className={`${className} bg-gray-200 text-gray-500`}>-</span>;
  }

  // Ensure score is between 0 and 10
  const normalizedScore = Math.max(0, Math.min(10, score));

  // Color mapping function
  const getColorClass = (score: number) => {
    if (score <= 2) return "bg-green-500 text-white";
    if (score <= 4) return "bg-yellow-400 text-black";
    if (score <= 6) return "bg-orange-500 text-white";
    if (score <= 8) return "bg-red-500 text-white";
    return "bg-red-600 animate-pulse text-white";
  };

  // Size and formatting classes
  const baseClasses =
    "inline-flex items-center justify-center rounded-full h-6 w-6 text-sm font-medium";

  return (
    <div
      className={`${baseClasses} ${getColorClass(normalizedScore)} ${className}`}
    >
      {normalizedScore}
    </div>
  );
}
