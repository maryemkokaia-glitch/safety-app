"use client";

import { useState } from "react";
import { useDemo, generateId } from "@/lib/demo-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Plus, History, ChevronRight, ClipboardList, FolderOpen, Play } from "lucide-react";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { useRouter } from "next/navigation";

export default function InspectorDashboard() {
  const { data, updateData, user, t } = useDemo();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showProjectSheet, setShowProjectSheet] = useState(false);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const [showNewInspection, setShowNewInspection] = useState(false);

  const { findProject, findTemplate } = useDataLookup(data);
  const myInspections = data.inspections.filter((i) => i.inspector_id === user.id);
  const inProgress = myInspections.filter((i) => i.status === "in_progress");
  const completed = myInspections.filter((i) => i.status === "completed");

  function startInspection() {
    if (!selectedProject || !selectedTemplate) return;
    const template = data.templates.find((t) => t.id === selectedTemplate);
    if (!template) return;
    const inspId = generateId();
    updateData((d) => ({ ...d, inspections: [...d.inspections, {
      id: inspId, project_id: selectedProject, template_id: selectedTemplate, inspector_id: user.id,
      status: "in_progress", safety_score: null, notes: null, weather: null,
      started_at: new Date().toISOString(), completed_at: null,
      items: template.items.map((item) => ({ id: generateId(), inspection_id: inspId, template_item_id: item.id, status: "not_applicable", comment: null, is_critical: item.is_critical, template_item: item, photos: [] })),
    }] }));
    setShowNewInspection(false);
    setSelectedProject("");
    setSelectedTemplate("");
    router.push(`/inspector/inspect/${inspId}`);
  }

  const activeProjects = data.projects.filter((p) => p.status === "active");

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("dashboard.title")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.full_name}</p>
        </div>
      </div>

      {/* New Inspection CTA */}
      {!showNewInspection ? (
        <button
          onClick={() => setShowNewInspection(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl p-5 mb-5 flex items-center gap-4 transition-colors shadow-sm"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-base">{t("inspection.new")}</p>
            <p className="text-sm text-blue-200">{t("inspection.select_project")}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-200" />
        </button>
      ) : (
        /* New Inspection Form — inline with action sheets */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">{t("inspection.new")}</h2>

          {/* Project selector */}
          <button
            onClick={() => setShowProjectSheet(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 mb-3 transition-colors active:bg-blue-50 min-h-[56px]"
          >
            <FolderOpen className={`w-5 h-5 ${selectedProject ? "text-blue-600" : "text-gray-400"}`} />
            <span className={`flex-1 text-left text-sm ${selectedProject ? "font-semibold text-gray-900" : "text-gray-400"}`}>
              {selectedProject ? findProject(selectedProject)?.name : t("inspection.select_project")}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Template selector */}
          <button
            onClick={() => setShowTemplateSheet(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 mb-4 transition-colors active:bg-blue-50 min-h-[56px]"
          >
            <ClipboardList className={`w-5 h-5 ${selectedTemplate ? "text-blue-600" : "text-gray-400"}`} />
            <span className={`flex-1 text-left text-sm ${selectedTemplate ? "font-semibold text-gray-900" : "text-gray-400"}`}>
              {selectedTemplate ? findTemplate(selectedTemplate)?.name : t("inspection.select_template")}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowNewInspection(false); setSelectedProject(""); setSelectedTemplate(""); }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[48px]"
            >
              {t("cancel")}
            </button>
            <button
              onClick={startInspection}
              disabled={!selectedProject || !selectedTemplate}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Play className="w-4 h-4" />
              {t("inspection.start")}
            </button>
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t("status.in_progress")}</h2>
          <div className="space-y-2.5">
            {inProgress.map((insp) => (
              <button key={insp.id} onClick={() => router.push(`/inspector/inspect/${insp.id}`)}
                className="w-full bg-white rounded-2xl border border-amber-200 p-4 flex items-center gap-3 hover:shadow-md active:bg-amber-50/50 transition-all text-left">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{findProject(insp.project_id)?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{findTemplate(insp.template_id)?.name}</p>
                </div>
                <Badge variant="warning" className="shrink-0">{t("status.in_progress")}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          {t("inspection.completed_list")} ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t("inspection.no_completed")}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completed.map((insp) => (
              <button key={insp.id} onClick={() => router.push(`/client/reports/${insp.id}`)}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md active:bg-gray-50 transition-all text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  (insp.safety_score ?? 0) >= 80 ? "bg-green-100" : (insp.safety_score ?? 0) >= 50 ? "bg-amber-100" : "bg-red-100"
                }`}>
                  <span className={`text-sm font-bold ${
                    (insp.safety_score ?? 0) >= 80 ? "text-green-700" : (insp.safety_score ?? 0) >= 50 ? "text-amber-700" : "text-red-700"
                  }`}>{insp.safety_score}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{findProject(insp.project_id)?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{findTemplate(insp.template_id)?.name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Sheets */}
      <ActionSheet
        open={showProjectSheet}
        onClose={() => setShowProjectSheet(false)}
        title={t("inspection.select_project")}
        options={activeProjects.map((p) => ({ value: p.id, label: p.name, icon: "📁", description: p.address || undefined }))}
        value={selectedProject}
        onChange={(v) => setSelectedProject(v)}
      />
      <ActionSheet
        open={showTemplateSheet}
        onClose={() => setShowTemplateSheet(false)}
        title={t("inspection.select_template")}
        options={data.templates.map((t) => ({ value: t.id, label: t.name, icon: "📋", description: `${t.items.length} ${t.items.length === 1 ? "item" : "items"}` }))}
        value={selectedTemplate}
        onChange={(v) => setSelectedTemplate(v)}
      />
    </div>
  );
}
