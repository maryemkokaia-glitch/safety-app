"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, AlertCircle, ChevronRight, CheckCircle2, X } from "lucide-react";
import { computeAlerts, severityColors } from "@/lib/utils/alerts";
import type { TranslationKey } from "@/lib/i18n";

export function ProjectAlertsBanner() {
  const { data, t } = useDemo();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const alerts = useMemo(() => computeAlerts(data), [data]);

  if (alerts.length === 0) {
    return null; // Hide completely when all clear — don't clutter dashboard
  }

  const high = alerts.filter((a) => a.severity === "high").length;
  const medium = alerts.filter((a) => a.severity === "medium").length;
  const topSeverity = high > 0 ? "high" : "medium";
  const colors = severityColors(topSeverity);
  const visible = expanded ? alerts : alerts.slice(0, 3);

  return (
    <div className={cn("rounded-2xl border mb-5 overflow-hidden", colors.bg, colors.border)}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/50">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", colors.dot)}>
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold", colors.text)}>
            {t("alerts.title")} ({alerts.length})
          </p>
          <p className={cn("text-[11px]", colors.text, "opacity-70")}>
            {high > 0 && `${high} მაღალი`}
            {high > 0 && medium > 0 && " · "}
            {medium > 0 && `${medium} საშუალო`}
          </p>
        </div>
      </div>
      <div className="divide-y divide-white/50">
        {visible.map((alert) => {
          const c = severityColors(alert.severity);
          const Icon = alert.severity === "high" ? AlertCircle : AlertTriangle;
          return (
            <button
              key={alert.id}
              onClick={() => router.push(alert.href)}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-white/40 active:bg-white/60 transition-colors"
            >
              <Icon className={cn("w-4 h-4 shrink-0", c.text)} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold truncate", c.text)}>
                  {t(alert.title_key as TranslationKey)}
                </p>
                <p className="text-[11px] text-gray-600 truncate">
                  {alert.project_name} · {alert.detail}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          );
        })}
      </div>
      {alerts.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full px-4 py-2 text-[11px] font-semibold border-t border-white/50 hover:bg-white/30 transition-colors",
            colors.text
          )}
        >
          {expanded ? t("cancel") : `+${alerts.length - 3}`}
        </button>
      )}
    </div>
  );
}
