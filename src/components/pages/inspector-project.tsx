"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Plus, ChevronRight, ClipboardList, Play, X, History } from "lucide-react";
import { ProjectDocuments } from "@/components/project-documents";
import { ProjectTimeline } from "@/components/project-timeline";
import { computeRiskScore, severityColors } from "@/lib/utils/alerts";
import type { TranslationKey } from "@/lib/i18n";


const categoryIcons: Record<string, string> = {
  scaffold_fixed: "🏗️",
  scaffold_mobile: "🚧",
  scaffold_suspended: "⛓️",
  harness_ppe: "🦺",
  equipment: "⚙️",
  ppe_general: "👷",
  physical_factors: "🌡️",
};

export default function InspectorProject() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateData, user, t } = useDemo();
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const project = data.projects.find((p) => p.id === id);
  if (!project) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  const projectInspections = data.inspections
    .filter((i) => i.project_id === id && i.inspector_id === user.id)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  const inProgress = projectInspections.filter((i) => i.status === "in_progress");
  const completed = projectInspections.filter((i) => i.status === "completed");

  function startInspection(templateId: string) {
    const template = data.templates.find((t) => t.id === templateId);
    if (!template) return;
    const inspId = generateId();
    updateData((d) => ({
      ...d,
      inspections: [
        ...d.inspections,
        {
          id: inspId,
          project_id: id,
          template_id: templateId,
          inspector_id: user.id,
          status: "in_progress",
          safety_score: null,
          notes: null,
          weather: null,
          started_at: new Date().toISOString(),
          completed_at: null,
          items: template.items.map((item) => ({
            id: generateId(),
            inspection_id: inspId,
            template_item_id: item.id,
            status: "not_applicable",
            comment: null,
            is_critical: item.is_critical,
            template_item: item,
            photos: [],
          })),
        },
      ],
    }));
    setShowTemplatePicker(false);
    router.push(`/inspector/inspect/${inspId}`);
  }

  return (
    <div className="pb-4">
      <div className="flex items-start gap-3 mb-5">
        <button onClick={() => router.push("/inspector")} aria-label="Back"
          className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 mt-0.5">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          {project.address && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {project.address}
            </p>
          )}
          {(() => {
            const risk = computeRiskScore(project, data);
            const c = severityColors(risk.level);
            return (
              <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-2 border", c.bg, c.text, c.border)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
                {t(`risk.${risk.level}` as TranslationKey)} · {risk.score}
              </div>
            );
          })()}
        </div>
      </div>

      {/* New Inspection Button / Template Picker */}
      {!showTemplatePicker ? (
        <button
          onClick={() => setShowTemplatePicker(true)}
          className="w-full bg-navy-800 hover:bg-navy-900 active:bg-navy-900 text-white rounded-2xl p-4 mb-5 flex items-center gap-3 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm">{t("inspection.new")}</p>
            <p className="text-xs text-navy-300">{t("inspection.pick_template")}</p>
          </div>
        </button>
      ) : (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">{t("inspection.pick_template")}</h2>
            <button onClick={() => setShowTemplatePicker(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          {data.templates.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">{t("no_data")}</p>
              <Link href="/inspector/templates"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white text-sm font-semibold rounded-xl hover:bg-navy-900">
                <Plus className="w-4 h-4" /> {t("template.new")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => startInspection(tmpl.id)}
                  className="bg-white rounded-xl border-2 border-gray-100 hover:border-navy-300 hover:bg-orange-50/50 active:bg-orange-50 p-4 text-left transition-all flex items-start gap-3"
                >
                  <span className="text-2xl mt-0.5">{categoryIcons[tmpl.category] || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{tmpl.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{tmpl.items.length} {t("template.items")}</p>
                  </div>
                  <Play className="w-4 h-4 text-navy-600 mt-1 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2.5">
            {t("status.in_progress")} ({inProgress.length})
          </h2>
          <div className="space-y-2">
            {inProgress.map((insp) => {
              const template = data.templates.find((t) => t.id === insp.template_id);
              const completedItems = insp.items.filter((i) => i.status !== "not_applicable").length;
              const progress = insp.items.length > 0 ? Math.round((completedItems / insp.items.length) * 100) : 0;
              return (
                <button key={insp.id} onClick={() => router.push(`/inspector/inspect/${insp.id}`)}
                  className="w-full bg-white rounded-xl border border-amber-200 p-4 flex items-center gap-3 hover:shadow-md active:bg-amber-50/50 transition-all text-left">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{template?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{progress}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          {t("inspection.completed_list")} ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">{t("inspection.no_completed")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completed.map((insp) => {
              const template = data.templates.find((t) => t.id === insp.template_id);
              return (
                <button key={insp.id} onClick={() => router.push(`/client/reports/${insp.id}`)}
                  className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md active:bg-gray-50 transition-all text-left">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    (insp.safety_score ?? 0) >= 80 ? "bg-green-100" : (insp.safety_score ?? 0) >= 50 ? "bg-amber-100" : "bg-red-100"
                  )}>
                    <span className={cn("text-sm font-bold",
                      (insp.safety_score ?? 0) >= 80 ? "text-green-700" : (insp.safety_score ?? 0) >= 50 ? "text-amber-700" : "text-red-700"
                    )}>{insp.safety_score}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{template?.name}</p>
                    {insp.completed_at && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{new Date(insp.completed_at).toLocaleDateString("ka-GE")}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="mt-6">
        <ProjectDocuments projectId={id} />
      </div>

      {/* Timeline */}
      <ProjectTimeline projectId={id} />
    </div>
  );
}
