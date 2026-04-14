import { cn } from "@/lib/utils/cn";
import { getScoreBgColor } from "@/lib/utils/safety-score";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ score, size = "sm", className }: ScoreBadgeProps) {
  const colorClass = getScoreBgColor(score);

  if (size === "lg") {
    return (
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", colorClass, className)}>
        <span className={cn("text-2xl font-black",
          score >= 80 ? "text-green-700" : score >= 50 ? "text-amber-700" : "text-red-700"
        )}>{score}%</span>
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colorClass, className)}>
        <span className={cn("text-sm font-bold",
          score >= 80 ? "text-green-700" : score >= 50 ? "text-amber-700" : "text-red-700"
        )}>{score}%</span>
      </div>
    );
  }

  return (
    <span className={cn("text-sm px-3 py-1 font-bold rounded-full", colorClass, className)}>
      {score}%
    </span>
  );
}
