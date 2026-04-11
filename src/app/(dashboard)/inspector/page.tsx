"use client";

import { useState } from "react";
import { useDemo, generateId } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Plus, History } from "lucide-react";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { useRouter } from "next/navigation";

export default function InspectorDashboard() {
  const { data, updateData, user, t } = useDemo();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const { findProject, findTemplate } = useDataLookup(data);
  const myInspections = data.inspections.filter((i) => i.inspector_id === user.id);

  function startInspection(e: React.FormEvent) {
    e.preventDefault();
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
    setShowModal(false);
    router.push(`/inspector/inspect/${inspId}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
        <Button onClick={() => setShowModal(true)} size="lg"><Plus className="w-5 h-5 mr-2" /> {t("inspection.new")}</Button>
      </div>

      {myInspections.filter((i) => i.status === "in_progress").length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("status.in_progress")}</h2>
          <div className="space-y-3">
            {myInspections.filter((i) => i.status === "in_progress").map((insp) => (
                <Card key={insp.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-yellow-400" onClick={() => router.push(`/inspector/inspect/${insp.id}`)}>
                  <CardContent className="flex items-center justify-between">
                    <div><p className="font-medium text-gray-900">{findProject(insp.project_id)?.name}</p><p className="text-sm text-gray-500">{findTemplate(insp.template_id)?.name}</p></div>
                    <Badge variant="warning">{t("status.in_progress")}</Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><div className="flex items-center gap-2"><History className="w-5 h-5 text-gray-400" /><h2 className="text-lg font-semibold">{t("inspection.completed_list")}</h2></div></CardHeader>
        <div className="divide-y divide-gray-100">
          {myInspections.filter((i) => i.status === "completed").length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">{t("inspection.no_completed")}</div>
          ) : myInspections.filter((i) => i.status === "completed").map((insp) => (
            <InspectionListItem
              key={insp.id}
              inspection={insp}
              href={`/client/reports/${insp.id}`}
              projectName={findProject(insp.project_id)?.name}
              templateName={findTemplate(insp.template_id)?.name}
            />
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t("inspection.new")}>
        <form onSubmit={startInspection} className="space-y-4">
          <Select id="project" label={t("nav.projects")} value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} options={[{ value: "", label: t("inspection.select_project") }, ...data.projects.filter((p) => p.status === "active").map((p) => ({ value: p.id, label: p.name }))]} />
          <Select id="template" label={t("nav.templates")} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} options={[{ value: "", label: t("inspection.select_template") }, ...data.templates.map((t) => ({ value: t.id, label: t.name }))]} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t("cancel")}</Button>
            <Button type="submit" disabled={!selectedProject || !selectedTemplate} className="flex-1">{t("inspection.start")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
