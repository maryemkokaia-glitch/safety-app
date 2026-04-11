"use client";



import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, updateData, t } = useDemo();
  const project = data.projects.find((p) => p.id === id);
  const inspections = data.inspections.filter((i) => i.project_id === id);
  const { findTemplate, findUser } = useDataLookup(data);
  const inspectors = data.users.filter((u) => u.role === "inspector");
  const clients = data.users.filter((u) => u.role === "client");

  if (!project) return <div className="text-center py-12 text-gray-500">{t("no_data")}</div>;

  function updateProject(field: string, value: string) {
    updateData((d) => ({ ...d, projects: d.projects.map((p) => p.id === id ? { ...p, [field]: value || null } : p) }));
  }

  return (
    <div>
      <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> {t("nav.projects")}</Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.address && <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-4 h-4" /> {project.address}</div>}
        </div>
        <Select value={project.status} onChange={(e) => updateProject("status", e.target.value)} options={[{ value: "active", label: t("status.active") }, { value: "paused", label: t("status.paused") }, { value: "completed", label: t("status.completed") }]} />
      </div>

      {/* Project Settings */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select id="inspector" label={t("project.inspector")} value=""
              onChange={(e) => {/* Inspector assignment for future */}}
              options={[{ value: "", label: t("project.select_inspector") }, ...inspectors.map((u) => ({ value: u.id, label: u.full_name }))]} />
            <Select id="client" label={t("project.client")} value={project.client_id || ""}
              onChange={(e) => updateProject("client_id", e.target.value)}
              options={[{ value: "", label: t("project.select_client") }, ...clients.map((u) => ({ value: u.id, label: u.full_name }))]} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div><p className="text-gray-500">{t("dashboard.inspections")}</p><p className="font-medium">{inspections.length}</p></div>
            <div><p className="text-gray-500">{t("project.created")}</p><p className="font-medium">{new Date(project.created_at).toLocaleDateString("ka-GE")}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Inspections */}
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">{t("dashboard.inspections")}</h2></CardHeader>
        <div className="divide-y divide-gray-100">
          {inspections.length === 0 ? <div className="px-6 py-8 text-center text-gray-500 text-sm">{t("project.no_inspections")}</div> : inspections.map((insp) => (
            <InspectionListItem
              key={insp.id}
              inspection={insp}
              href={`/client/reports/${insp.id}`}
              templateName={findTemplate(insp.template_id)?.name}
              inspectorName={findUser(insp.inspector_id)?.full_name}
              showStatus
              t={t}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
