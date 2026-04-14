"use client";

import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { ClipboardCheck, FileText, AlertTriangle, Clock } from "lucide-react";
import { useMemo } from "react";

type TimelineEvent = {
  id: string;
  date: string;
  type: "inspection_started" | "inspection_completed" | "document_uploaded" | "document_expires";
  title: string;
  detail?: string;
  href?: string;
  severity: "low" | "medium" | "high";
};

export function ProjectTimeline({ projectId }: { projectId: string }) {
  const { data, t } = useDemo();

  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = [];

    // Inspections for this project
    const inspections = data.inspections.filter((i) => i.project_id === projectId);
    for (const insp of inspections) {
      const template = data.templates.find((tt) => tt.id === insp.template_id);
      if (insp.completed_at) {
        list.push({
          id: `insp-done-${insp.id}`,
          date: insp.completed_at,
          type: "inspection_completed",
          title: t("timeline.inspection_completed"),
          detail: `${template?.name ?? ""} · ${insp.safety_score ?? 0}%`,
          href: `/client/reports/${insp.id}`,
          severity: (insp.safety_score ?? 100) < 50 ? "high" : (insp.safety_score ?? 100) < 80 ? "medium" : "low",
        });
      } else {
        list.push({
          id: `insp-start-${insp.id}`,
          date: insp.started_at,
          type: "inspection_started",
          title: t("timeline.inspection_started"),
          detail: template?.name,
          href: `/inspector/inspect/${insp.id}`,
          severity: "medium",
        });
      }
    }

    // Documents for this project
    const docs = (data.documents || []).filter((d) => d.project_id === projectId);
    for (const doc of docs) {
      list.push({
        id: `doc-up-${doc.id}`,
        date: doc.uploaded_at,
        type: "document_uploaded",
        title: t("timeline.document_uploaded"),
        detail: doc.title,
        severity: "low",
      });
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, projectId, t]);

  if (events.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-gray-400" />
        {t("timeline.title")} ({events.length})
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-3">
            {events.slice(0, 8).map((ev) => {
              const Icon =
                ev.type === "inspection_completed"
                  ? ClipboardCheck
                  : ev.type === "inspection_started"
                  ? AlertTriangle
                  : FileText;
              const color =
                ev.severity === "high"
                  ? "bg-red-500"
                  : ev.severity === "medium"
                  ? "bg-amber-500"
                  : "bg-green-500";
              return (
                <div key={ev.id} className="relative">
                  <div className={cn("absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-white", color)} />
                  <div className="flex items-start gap-2">
                    <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{ev.title}</p>
                      {ev.detail && <p className="text-[11px] text-gray-500 truncate">{ev.detail}</p>}
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(ev.date).toLocaleDateString("ka-GE")}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {events.length > 8 && (
            <p className="text-[10px] text-gray-400 mt-2 pl-1">+{events.length - 8}</p>
          )}
        </div>
      </div>
    </div>
  );
}
