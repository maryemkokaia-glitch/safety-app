"use client";

import { useDemo } from "@/lib/demo-context";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ClipboardList, FolderOpen, AlertTriangle } from "lucide-react";

export default function InspectorDashboard() {
  const { data, user, t } = useDemo();
  const router = useRouter();

  const myInspections = data.inspections.filter((i) => i.inspector_id === user.id);
  const inProgress = myInspections.filter((i) => i.status === "in_progress");
  const activeProjects = data.projects.filter((p) => p.status === "active");

  // Get inspection stats per project
  function getProjectStats(projectId: string) {
    const projectInspections = myInspections.filter((i) => i.project_id === projectId);
    const completed = projectInspections.filter((i) => i.status === "completed");
    const lastCompleted = completed[0];
    return {
      total: projectInspections.length,
      inProgress: projectInspections.filter((i) => i.status === "in_progress").length,
      lastScore: lastCompleted?.safety_score ?? null,
    };
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">{t("nav.projects")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user.full_name}</p>
      </div>

      {/* In Progress — quick access */}
      {inProgress.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t("status.in_progress")} ({inProgress.length})
          </h2>
          <div className="space-y-2">
            {inProgress.map((insp) => {
              const project = data.projects.find((p) => p.id === insp.project_id);
              const template = data.templates.find((t) => t.id === insp.template_id);
              return (
                <button key={insp.id} onClick={() => router.push(`/inspector/inspect/${insp.id}`)}
                  className="w-full bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center gap-3 hover:shadow-md active:bg-amber-100 transition-all text-left">
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{project?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{template?.name}</p>
                  </div>
                  <Badge variant="warning" className="shrink-0 text-xs">{t("status.in_progress")}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Project cards */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          {t("nav.projects")} ({activeProjects.length})
        </h2>
        {activeProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{t("project.no_projects")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project) => {
              const stats = getProjectStats(project.id);
              return (
                <button key={project.id} onClick={() => router.push(`/inspector/project/${project.id}`)}
                  className="w-full bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-blue-200 active:bg-gray-50 transition-all text-left">
                  {/* Score badge or folder icon */}
                  {stats.lastScore !== null ? (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      stats.lastScore >= 80 ? "bg-green-100" : stats.lastScore >= 50 ? "bg-amber-100" : "bg-red-100"
                    }`}>
                      <span className={`text-base font-bold ${
                        stats.lastScore >= 80 ? "text-green-700" : stats.lastScore >= 50 ? "text-amber-700" : "text-red-700"
                      }`}>{stats.lastScore}%</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <FolderOpen className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">{project.name}</p>
                    {project.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {project.address}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-500">{stats.total} {t("dashboard.inspections")}</span>
                      {stats.inProgress > 0 && (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5">{stats.inProgress} {t("status.in_progress")}</Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
