"use client";

import { useState } from "react";
import { useDemo, generateId } from "@/lib/demo-context";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ClipboardList, FolderOpen, Plus, X, Zap, ArrowRight } from "lucide-react";
import { ProjectAlertsBanner } from "@/components/project-alerts-banner";
import { computeRiskScore, severityColors } from "@/lib/utils/alerts";

export default function InspectorDashboard() {
  const { data, updateData, user, t } = useDemo();
  const router = useRouter();
  const [showAddProject, setShowAddProject] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newClientEmails, setNewClientEmails] = useState("");

  const myInspections = data.inspections.filter((i) => i.inspector_id === user.id);
  const inProgress = myInspections.filter((i) => i.status === "in_progress");
  const completed = myInspections.filter((i) => i.status === "completed");
  const activeProjects = data.projects.filter((p) => p.status === "active");

  const firstName = user.full_name.split(" ")[0];
  const today = new Date().toLocaleDateString("ka-GE", { weekday: "long", day: "numeric", month: "long" });

  function getProjectStats(projectId: string) {
    const projectInspections = myInspections.filter((i) => i.project_id === projectId);
    const comp = projectInspections.filter((i) => i.status === "completed");
    const lastCompleted = comp.sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0];
    return {
      total: projectInspections.length,
      inProgress: projectInspections.filter((i) => i.status === "in_progress").length,
      lastScore: lastCompleted?.safety_score ?? null,
    };
  }

  function addProject() {
    if (!newName.trim()) return;
    const projectId = generateId();
    const emails = newClientEmails.split(/[,;\s]+/).map((e) => e.trim()).filter((e) => e.includes("@"));
    updateData((d) => ({
      ...d,
      projects: [...d.projects, {
        id: projectId, company_id: "company-1", name: newName.trim(),
        address: newAddress.trim() || null, status: "active",
        client_id: null, inspector_id: user.id,
        client_emails: emails,
        created_at: new Date().toISOString(),
      }],
    }));
    setNewName(""); setNewAddress(""); setNewClientEmails(""); setShowAddProject(false);
    router.push(`/inspector/project/${projectId}`);
  }

  // Get the most recent in-progress inspection for hero card
  const heroInspection = inProgress.sort((a, b) =>
    new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )[0];
  const heroProject = heroInspection ? data.projects.find((p) => p.id === heroInspection.project_id) : null;
  const heroTemplate = heroInspection ? data.templates.find((t) => t.id === heroInspection.template_id) : null;
  const heroCompletedItems = heroInspection ? heroInspection.items.filter((i) => i.status !== "not_applicable").length : 0;
  const heroProgress = heroInspection && heroInspection.items.length > 0 ? Math.round((heroCompletedItems / heroInspection.items.length) * 100) : 0;

  return (
    <div className="pb-4">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">
          👋 {t("dashboard.greeting")}, {firstName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Compliance alerts banner */}
      <ProjectAlertsBanner />

      {/* Stats strip */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-center">
          <p className="text-lg font-bold text-gray-900">{activeProjects.length}</p>
          <p className="text-[10px] text-gray-400 font-medium">{t("nav.projects")}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-center">
          <p className="text-lg font-bold text-gray-900">{completed.length}</p>
          <p className="text-[10px] text-gray-400 font-medium">{t("inspection.completed_list")}</p>
        </div>
        <div className={cn("flex-1 rounded-xl border px-3 py-2.5 text-center",
          inProgress.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
        )}>
          <p className={cn("text-lg font-bold", inProgress.length > 0 ? "text-amber-600" : "text-gray-900")}>{inProgress.length}</p>
          <p className="text-[10px] text-gray-400 font-medium">{t("dashboard.in_progress")}</p>
        </div>
      </div>

      {/* Hero: Resume in-progress inspection */}
      {heroInspection && heroProject && (
        <button
          onClick={() => router.push(`/inspector/inspect/${heroInspection.id}`)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-5 text-left text-white shadow-lg shadow-blue-600/20 active:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-bold text-blue-100">{t("dashboard.resume")}</span>
          </div>
          <p className="text-base font-bold mb-0.5">{heroProject.name}</p>
          <p className="text-sm text-blue-200 mb-3">{heroTemplate?.name}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-[width] duration-500" style={{ width: `${heroProgress}%` }} />
            </div>
            <span className="text-sm font-bold text-white">{heroProgress}%</span>
            <ArrowRight className="w-4 h-4 text-blue-200" />
          </div>
        </button>
      )}

      {/* Other in-progress (if more than 1) */}
      {inProgress.length > 1 && (
        <div className="mb-5">
          <div className="space-y-2">
            {inProgress.slice(1).map((insp) => {
              const project = data.projects.find((p) => p.id === insp.project_id);
              const template = data.templates.find((t) => t.id === insp.template_id);
              return (
                <button key={insp.id} onClick={() => router.push(`/inspector/inspect/${insp.id}`)}
                  className="w-full bg-amber-50 rounded-xl border border-amber-200 p-3.5 flex items-center gap-3 active:bg-amber-100 transition-all text-left">
                  <ClipboardList className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{project?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{template?.name}</p>
                  </div>
                  <Badge variant="warning" className="text-[10px] shrink-0">{t("dashboard.in_progress")}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* My Projects */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">{t("dashboard.my_projects")}</h2>
        <span className="text-xs text-gray-400">{activeProjects.length} {t("nav.projects")}</span>
      </div>

      {activeProjects.length === 0 && !showAddProject ? (
        /* Empty state — first project CTA */
        <button
          onClick={() => setShowAddProject(true)}
          className="w-full bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center hover:bg-blue-100/50 active:bg-blue-100 transition-colors"
        >
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plus className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-base font-bold text-blue-700">{t("dashboard.add_first_project")}</p>
          <p className="text-sm text-blue-400 mt-1">{t("project.name")} + {t("project.address")}</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {activeProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const risk = computeRiskScore(project, data);
            const riskC = severityColors(risk.level);
            return (
              <button key={project.id} onClick={() => router.push(`/inspector/project/${project.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md hover:border-blue-200 active:bg-gray-50 transition-all relative">
                {/* Risk indicator dot — top-right */}
                <span
                  className={cn("absolute top-3 right-3 w-2.5 h-2.5 rounded-full", riskC.dot)}
                  title={`${t(`risk.${risk.level}` as any)}: ${risk.score}`}
                />
                {/* Score or icon */}
                {stats.lastScore !== null ? (
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    stats.lastScore >= 80 ? "bg-green-100" : stats.lastScore >= 50 ? "bg-amber-100" : "bg-red-100"
                  )}>
                    <span className={cn("text-sm font-bold",
                      stats.lastScore >= 80 ? "text-green-700" : stats.lastScore >= 50 ? "text-amber-700" : "text-red-700"
                    )}>{stats.lastScore}%</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1 pr-4">{project.name}</p>
                {project.address && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{project.address}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5">{stats.total} {t("dashboard.inspections")}</p>
              </button>
            );
          })}
          {/* Add new project card */}
          <button
            onClick={() => setShowAddProject(true)}
            className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/50 active:bg-blue-50 transition-colors min-h-[140px]"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500">{t("dashboard.add_project")}</p>
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      <Modal open={showAddProject} onClose={() => setShowAddProject(false)} title={t("project.new")}>
        <div className="space-y-3">
          <Input id="projectName" label={t("project.name")} placeholder="მაგ: საცხოვრებელი კომპლექსი" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <Input id="projectAddress" label={t("project.address")} placeholder="მაგ: ჭავჭავაძის 45, თბილისი" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          <div>
            <Input id="clientEmails" label={`${t("project.client_emails")} (${t("project.client_emails_hint")})`} placeholder={t("project.client_emails_placeholder")} value={newClientEmails} onChange={(e) => setNewClientEmails(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowAddProject(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 min-h-[48px]">{t("cancel")}</button>
            <button onClick={addProject} disabled={!newName.trim()} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-navy-800 disabled:bg-gray-200 disabled:text-gray-400 min-h-[48px]">{t("create")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
