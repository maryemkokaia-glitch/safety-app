"use client";

import { Badge } from "@/components/ui/badge";
import { getScoreBgColor } from "@/lib/utils/safety-score";
import type { InspectionWithItems } from "@/lib/database.types";
import type { TranslationKey } from "@/lib/i18n";
import Link from "next/link";

interface InspectionListItemProps {
  inspection: InspectionWithItems;
  href: string;
  projectName?: string;
  templateName?: string;
  inspectorName?: string;
  date?: string;
  showStatus?: boolean;
  t?: (key: TranslationKey) => string;
}

export function InspectionListItem({
  inspection,
  href,
  projectName,
  templateName,
  inspectorName,
  date,
  showStatus = false,
  t,
}: InspectionListItemProps) {
  const displayDate = date ?? new Date(inspection.started_at).toLocaleDateString("ka-GE");
  const subtitle = [inspectorName, displayDate].filter(Boolean).join(" \u2022 ");

  return (
    <Link href={href}>
      <div className="px-4 py-3 sm:px-6 flex items-center justify-between hover:bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {[projectName, templateName].filter(Boolean).join(" - ")}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {inspection.safety_score != null && (
            <Badge className={getScoreBgColor(inspection.safety_score)}>
              {inspection.safety_score}%
            </Badge>
          )}
          {showStatus && t && (
            <Badge variant={inspection.status === "completed" ? "success" : "warning"}>
              {inspection.status === "completed" ? t("status.completed") : t("status.in_progress")}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
