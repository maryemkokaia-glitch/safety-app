import type { Metadata } from "next";
import { getDefaultData } from "@/lib/demo-data";
import { ExpertProfile } from "@/components/expert-profile";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = getDefaultData();
  const user = data.users.find((u) => u.id === id);
  if (!user) return { title: "Sarke — Expert" };
  return {
    title: `${user.full_name} — Sarke`,
    description: `${user.full_name} — Safety compliance specialist on Sarke`,
  };
}

export default async function ExpertPage({ params }: Props) {
  const { id } = await params;
  const data = getDefaultData();
  const user = data.users.find((u) => u.id === id);

  if (!user || user.role !== "inspector") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm text-gray-500">ექსპერტი ვერ მოიძებნა</p>
        </div>
      </div>
    );
  }

  // Aggregate stats from the demo data (read-only, server-side)
  const inspections = data.inspections.filter((i) => i.inspector_id === id);
  const completed = inspections.filter((i) => i.status === "completed");
  const projects = data.projects.filter((p) => p.inspector_id === id);
  const activeProjects = projects.filter((p) => p.status === "active");
  const scores = completed.map((i) => i.safety_score ?? 0).filter((s) => s > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Derive specialties from template categories used
  const usedCategories = new Set<string>();
  for (const insp of completed) {
    const tmpl = data.templates.find((t) => t.id === insp.template_id);
    if (tmpl) usedCategories.add(tmpl.category);
  }

  return (
    <ExpertProfile
      user={user}
      stats={{
        activeProjectsCount: activeProjects.length,
        completedInspectionsCount: completed.length,
        averageScore: avgScore,
        specialties: Array.from(usedCategories),
      }}
    />
  );
}
