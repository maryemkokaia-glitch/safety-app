import type { AppData } from "../store";
import type { Project } from "../database.types";
import { getLatestCompletedInspection } from "./alerts";

export type ScheduleReason =
  | "never_inspected"
  | "overdue"
  | "due_soon"
  | "document_expiring";

export interface ScheduleItem {
  project_id: string;
  project_name: string;
  address: string | null;
  reason: ScheduleReason;
  priority: number; // higher = more urgent
  detail: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Compute the "this week" inspection queue for an expert based on their projects.
 * Returns a sorted list (most urgent first).
 */
export function computeSchedule(data: AppData, inspectorId: string, now = new Date()): ScheduleItem[] {
  const myProjects = data.projects.filter(
    (p) => p.inspector_id === inspectorId && p.status === "active"
  );

  const items: ScheduleItem[] = [];

  for (const project of myProjects) {
    const latest = getLatestCompletedInspection(project.id, data);

    if (!latest) {
      const created = new Date(project.created_at).getTime();
      const daysSinceCreation = Math.floor((now.getTime() - created) / DAY_MS);
      if (daysSinceCreation > 0) {
        items.push({
          project_id: project.id,
          project_name: project.name,
          address: project.address,
          reason: "never_inspected",
          priority: 100,
          detail: "პირველი ინსპექცია",
        });
        continue;
      }
    } else {
      const lastDate = new Date(latest.completed_at || latest.started_at).getTime();
      const daysSince = Math.floor((now.getTime() - lastDate) / DAY_MS);
      if (daysSince > 30) {
        items.push({
          project_id: project.id,
          project_name: project.name,
          address: project.address,
          reason: "overdue",
          priority: 90 + Math.min(daysSince - 30, 10),
          detail: `${daysSince} დღის წინ`,
        });
        continue;
      }
      if (daysSince > 14) {
        items.push({
          project_id: project.id,
          project_name: project.name,
          address: project.address,
          reason: "due_soon",
          priority: 60,
          detail: `${daysSince} დღის წინ`,
        });
        continue;
      }
    }

    // Document expiry as a reason to visit the site
    const docs = (data.documents || []).filter((d) => d.project_id === project.id);
    for (const doc of docs) {
      if (!doc.expiry_date) continue;
      const diff = Math.floor((new Date(doc.expiry_date).getTime() - now.getTime()) / DAY_MS);
      if (diff < 7 && diff >= -30) {
        items.push({
          project_id: project.id,
          project_name: project.name,
          address: project.address,
          reason: "document_expiring",
          priority: 70,
          detail: `${doc.title}${diff < 0 ? " (ვადაგასული)" : ` ${diff}დ`}`,
        });
        break;
      }
    }
  }

  return items.sort((a, b) => b.priority - a.priority);
}
