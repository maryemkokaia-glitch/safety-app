"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Calendar, ChevronRight, AlertCircle, Clock, FileText } from "lucide-react";
import { computeSchedule } from "@/lib/utils/schedule";
import type { ScheduleReason } from "@/lib/utils/schedule";

const reasonConfig: Record<
  ScheduleReason,
  { icon: typeof Calendar; bg: string; text: string; labelKey: string }
> = {
  never_inspected: { icon: AlertCircle, bg: "bg-red-50", text: "text-red-600", labelKey: "schedule.never_inspected" },
  overdue: { icon: AlertCircle, bg: "bg-red-50", text: "text-red-600", labelKey: "schedule.overdue" },
  due_soon: { icon: Clock, bg: "bg-amber-50", text: "text-amber-600", labelKey: "schedule.due_soon" },
  document_expiring: { icon: FileText, bg: "bg-amber-50", text: "text-amber-600", labelKey: "schedule.document_expiring" },
};

export function InspectionQueue() {
  const { data, user, t } = useDemo();
  const router = useRouter();

  const items = useMemo(() => computeSchedule(data, user.id), [data, user.id]);

  if (items.length === 0) return null;

  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        {t("schedule.title")} ({items.length})
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {items.slice(0, 5).map((item) => {
          const cfg = reasonConfig[item.reason];
          const Icon = cfg.icon;
          return (
            <button
              key={`${item.project_id}-${item.reason}`}
              onClick={() => router.push(`/inspector/project/${item.project_id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                <Icon className={cn("w-4 h-4", cfg.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.project_name}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {t(cfg.labelKey as any)} · {item.detail}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>
      {items.length > 5 && (
        <p className="text-[10px] text-gray-400 mt-1.5 text-right">+{items.length - 5}</p>
      )}
    </div>
  );
}
