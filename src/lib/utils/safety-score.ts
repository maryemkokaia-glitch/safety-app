import { InspectionItem, ChecklistItemStatus } from "../database.types";

export function calculateSafetyScore(items: InspectionItem[]): number {
  const applicable = items.filter((i) => i.status !== "not_applicable");
  if (applicable.length === 0) return 100;

  const safeCount = applicable.filter((i) => i.status === "safe").length;
  let score = (safeCount / applicable.length) * 100;

  // Extra penalty for critical violations
  for (const item of applicable) {
    if (item.status === "violation" && item.is_critical) {
      score -= 10;
    }
  }

  return Math.max(0, Math.round(score));
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 70) return "bg-yellow-100 text-yellow-800";
  if (score >= 50) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "შესანიშნავი";
  if (score >= 70) return "კარგი";
  if (score >= 50) return "საჭიროებს ყურადღებას";
  return "კრიტიკული";
}

export function getStatusLabel(status: ChecklistItemStatus): string {
  switch (status) {
    case "safe": return "ვარგისია";
    case "violation": return "დაზიანებულია";
    case "not_applicable": return "არ ეხება";
    default: return status;
  }
}

export function getStatusColor(status: ChecklistItemStatus): string {
  switch (status) {
    case "safe": return "bg-green-100 text-green-800";
    case "violation": return "bg-red-100 text-red-800";
    case "not_applicable": return "bg-gray-100 text-gray-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

/**
 * Auto-determine status from a measured value compared against norm range.
 * - Within range → safe
 * - Outside range → violation
 * - No value → not_applicable
 */
export function getStatusFromMeasurement(
  value: number | null | undefined,
  normMin: number | null | undefined,
  normMax: number | null | undefined,
): ChecklistItemStatus {
  if (value == null) return "not_applicable";

  const min = normMin ?? -Infinity;
  const max = normMax ?? Infinity;

  if (value >= min && value <= max) return "safe";
  return "violation";
}

/**
 * Format a norm range for display, e.g., "20-22 °C" or "<80 dB" or "≥500 ლუქსი"
 */
export function formatNormRange(
  normMin: number | null | undefined,
  normMax: number | null | undefined,
  unit?: string,
): string {
  const u = unit ? ` ${unit}` : "";
  if (normMin != null && normMax != null) return `${normMin}–${normMax}${u}`;
  if (normMin != null) return `≥${normMin}${u}`;
  if (normMax != null) return `≤${normMax}${u}`;
  return "";
}
