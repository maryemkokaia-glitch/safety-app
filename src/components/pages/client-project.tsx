"use client";



import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InspectionListItem } from "@/components/inspection-list-item";
import { useDataLookup } from "@/lib/hooks/use-data-lookup";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function ClientProject() {
  const { id } = useParams<{ id: string }>();
  const { data, t } = useDemo();
  const { findTemplate } = useDataLookup(data);
  const project = data.projects.find((p) => p.id === id);
  const inspections = data.inspections.filter((i) => i.project_id === id && i.status === "completed");

  if (!project) return <div className="text-center py-12 text-gray-500">პროექტი ვერ მოიძებნა</div>;

  const scores = inspections.filter((i) => i.safety_score != null).map((i) => i.safety_score!);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div>
      <Link href="/client" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> უკან</Link>
      <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
      {project.address && <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 mb-6"><MapPin className="w-4 h-4" /> {project.address}</div>}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card><CardContent className="text-center"><p className="text-3xl font-bold">{inspections.length}</p><p className="text-sm text-gray-500">ინსპექცია</p></CardContent></Card>
        <Card><CardContent className="text-center">{avgScore != null ? <><p className="text-3xl font-bold">{avgScore}%</p><p className="text-sm text-gray-500">საშუალო ქულა</p></> : <><p className="text-3xl font-bold text-gray-300">-</p><p className="text-sm text-gray-500">საშუალო ქულა</p></>}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">ინსპექციები</h2></CardHeader>
        <div className="divide-y divide-gray-100">
          {inspections.length === 0 ? <div className="px-6 py-8 text-center text-gray-500 text-sm">{t("dashboard.no_inspections")}</div> : inspections.map((insp) => (
            <InspectionListItem
              key={insp.id}
              inspection={insp}
              href={`/client/reports/${insp.id}`}
              templateName={findTemplate(insp.template_id)?.name}
              date={insp.completed_at ? new Date(insp.completed_at).toLocaleDateString("ka-GE") : undefined}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
