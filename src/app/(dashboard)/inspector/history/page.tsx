"use client";

import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ui/score-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { History, ChevronRight, ClipboardList, CheckCircle } from "lucide-react";

function getDateGroup(dateStr: string, t: (k: any) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (date >= today) return t("dashboard.today");
  if (date >= weekAgo) return t("dashboard.this_week");
  return t("dashboard.earlier");
}

export default function InspectionHistoryPage() {
  const { data, user, t } = useDemo();
  const router = useRouter();

  const inspections = [...data.inspections.filter((i) => i.inspector_id === user.id)]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  const completedCount = inspections.filter((i) => i.status === "completed").length;
  const inProgressCount = inspections.filter((i) => i.status === "in_progress").length;

  // Group by date
  const groups: { label: string; items: typeof inspections }[] = [];
  const groupMap = new Map<string, typeof inspections>();
  for (const insp of inspections) {
    const label = getDateGroup(insp.started_at, t);
    let arr = groupMap.get(label);
    if (!arr) {
      arr = [];
      groupMap.set(label, arr);
      groups.push({ label, items: arr });
    }
    arr.push(insp);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">{t("inspection.history")}</h1>

      {/* Summary */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {completedCount} {t("inspection.completed_list")}
        </span>
        {inProgressCount > 0 && (
          <span className="text-sm text-amber-600 flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" /> {inProgressCount} {t("dashboard.in_progress")}
          </span>
        )}
      </div>

      {inspections.length === 0 ? (
        <EmptyState icon={History} title={t("dashboard.no_inspections")} />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">{group.label}</h2>
              <div className="space-y-2">
                {group.items.map((insp) => {
                  const isCompleted = insp.status === "completed";
                  const project = data.projects.find((p) => p.id === insp.project_id);
                  const template = data.templates.find((t) => t.id === insp.template_id);
                  const href = isCompleted ? `/client/reports/${insp.id}` : `/inspector/inspect/${insp.id}`;
                  return (
                    <button key={insp.id} onClick={() => router.push(href)}
                      className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md active:bg-gray-50 transition-all text-left">
                      {isCompleted ? (
                        <ScoreBadge score={insp.safety_score ?? 0} size="md" />
                      ) : (
                        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                          <ClipboardList className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{project?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{template?.name}</p>
                        {insp.completed_at && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(insp.completed_at).toLocaleDateString("ka-GE")}</p>
                        )}
                      </div>
                      {!isCompleted && <Badge variant="warning" className="shrink-0 text-[10px]">{t("dashboard.in_progress")}</Badge>}
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
