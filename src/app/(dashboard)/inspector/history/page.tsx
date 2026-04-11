"use client";

import { useDemo } from "@/lib/demo-context";
import { Badge } from "@/components/ui/badge";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { useRouter } from "next/navigation";
import { History, ChevronRight, ClipboardList } from "lucide-react";

export default function InspectionHistoryPage() {
  const { data, user, t } = useDemo();
  const { findProject, findTemplate } = useDataLookup(data);
  const router = useRouter();
  const inspections = [...data.inspections.filter((i) => i.inspector_id === user.id)].reverse();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-5">{t("inspection.history")}</h1>
      {inspections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t("dashboard.no_inspections")}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {inspections.map((insp) => {
            const isCompleted = insp.status === "completed";
            const href = isCompleted ? `/client/reports/${insp.id}` : `/inspector/inspect/${insp.id}`;
            return (
              <button key={insp.id} onClick={() => router.push(href)}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md active:bg-gray-50 transition-all text-left">
                {isCompleted ? (
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    (insp.safety_score ?? 0) >= 80 ? "bg-green-100" : (insp.safety_score ?? 0) >= 50 ? "bg-amber-100" : "bg-red-100"
                  }`}>
                    <span className={`text-sm font-bold ${
                      (insp.safety_score ?? 0) >= 80 ? "text-green-700" : (insp.safety_score ?? 0) >= 50 ? "text-amber-700" : "text-red-700"
                    }`}>{insp.safety_score}%</span>
                  </div>
                ) : (
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{findProject(insp.project_id)?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{findTemplate(insp.template_id)?.name}</p>
                  {insp.completed_at && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(insp.completed_at).toLocaleDateString("ka-GE")}</p>
                  )}
                </div>
                {!isCompleted && <Badge variant="warning" className="shrink-0">{t("status.in_progress")}</Badge>}
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
