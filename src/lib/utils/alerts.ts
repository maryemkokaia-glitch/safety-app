import type { AppData } from "../store";
import type { Project, ProjectDocument, DocumentStatus, InspectionWithItems } from "../database.types";

export type AlertSeverity = "low" | "medium" | "high";

export type AlertType =
  | "document_expired"
  | "document_expiring"
  | "inspection_gap"
  | "low_score";

export interface Alert {
  id: string;
  project_id: string;
  project_name: string;
  type: AlertType;
  severity: AlertSeverity;
  title_key: string;
  detail: string;
  href: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Compute the status of a single document based on its expiry.
 */
export function getDocumentStatus(doc: ProjectDocument, now = new Date()): DocumentStatus {
  if (!doc.expiry_date) return "no_expiry";
  const expiry = new Date(doc.expiry_date);
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / DAY_MS);
  if (diffDays < 0) return "expired";
  if (diffDays < 7) return "expiring_soon";
  return "valid";
}

/**
 * Days until expiry (negative if past).
 */
export function daysUntilExpiry(doc: ProjectDocument, now = new Date()): number | null {
  if (!doc.expiry_date) return null;
  const expiry = new Date(doc.expiry_date);
  return Math.floor((expiry.getTime() - now.getTime()) / DAY_MS);
}

/**
 * Get the latest completed inspection for a project.
 */
export function getLatestCompletedInspection(
  projectId: string,
  data: AppData
): InspectionWithItems | undefined {
  return data.inspections
    .filter((i) => i.project_id === projectId && i.status === "completed")
    .sort((a, b) => {
      const aDate = a.completed_at || a.started_at;
      const bDate = b.completed_at || b.started_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];
}

/**
 * Derive all alerts from the current app data.
 */
export function computeAlerts(data: AppData, now = new Date()): Alert[] {
  const alerts: Alert[] = [];
  const activeProjects = data.projects.filter((p) => p.status === "active");

  for (const project of activeProjects) {
    // Document alerts
    const projectDocs = (data.documents || []).filter((d) => d.project_id === project.id);
    for (const doc of projectDocs) {
      const status = getDocumentStatus(doc, now);
      const days = daysUntilExpiry(doc, now);
      if (status === "expired") {
        alerts.push({
          id: `alert-doc-expired-${doc.id}`,
          project_id: project.id,
          project_name: project.name,
          type: "document_expired",
          severity: "high",
          title_key: "alerts.document_expired",
          detail: `${doc.title} — ${Math.abs(days ?? 0)} დღის წინ`,
          href: `/inspector/project/${project.id}`,
        });
      } else if (status === "expiring_soon") {
        alerts.push({
          id: `alert-doc-expiring-${doc.id}`,
          project_id: project.id,
          project_name: project.name,
          type: "document_expiring",
          severity: "medium",
          title_key: "alerts.document_expiring",
          detail: `${doc.title} — ${days} დღეში`,
          href: `/inspector/project/${project.id}`,
        });
      }
    }

    // Inspection gap + low score alerts
    const latest = getLatestCompletedInspection(project.id, data);
    if (!latest) {
      // No completed inspections ever — only flag if project was created >30 days ago
      const created = new Date(project.created_at).getTime();
      if (now.getTime() - created > 30 * DAY_MS) {
        alerts.push({
          id: `alert-inspection-gap-${project.id}`,
          project_id: project.id,
          project_name: project.name,
          type: "inspection_gap",
          severity: "medium",
          title_key: "alerts.inspection_gap",
          detail: "ინსპექცია ჯერ არ ჩატარებულა",
          href: `/inspector/project/${project.id}`,
        });
      }
    } else {
      const lastDate = new Date(latest.completed_at || latest.started_at).getTime();
      const daysSince = Math.floor((now.getTime() - lastDate) / DAY_MS);
      if (daysSince > 30) {
        alerts.push({
          id: `alert-inspection-gap-${project.id}`,
          project_id: project.id,
          project_name: project.name,
          type: "inspection_gap",
          severity: "medium",
          title_key: "alerts.inspection_gap",
          detail: `${daysSince} დღის წინ`,
          href: `/inspector/project/${project.id}`,
        });
      }
      if ((latest.safety_score ?? 100) < 50) {
        alerts.push({
          id: `alert-low-score-${project.id}`,
          project_id: project.id,
          project_name: project.name,
          type: "low_score",
          severity: "high",
          title_key: "alerts.low_score",
          detail: `${latest.safety_score}%`,
          href: `/client/reports/${latest.id}`,
        });
      }
    }
  }

  // Sort by severity (high first), then by project name
  const sev: Record<AlertSeverity, number> = { high: 0, medium: 1, low: 2 };
  return alerts.sort((a, b) => {
    const s = sev[a.severity] - sev[b.severity];
    if (s !== 0) return s;
    return a.project_name.localeCompare(b.project_name);
  });
}

/**
 * Compute a simple risk score (0-100) and level for a single project.
 */
export function computeRiskScore(
  project: Project,
  data: AppData,
  now = new Date()
): { score: number; level: AlertSeverity } {
  let score = 0;

  const docs = (data.documents || []).filter((d) => d.project_id === project.id);
  let expiredCount = 0;
  let expiringCount = 0;
  for (const doc of docs) {
    const status = getDocumentStatus(doc, now);
    if (status === "expired") expiredCount++;
    if (status === "expiring_soon") expiringCount++;
  }
  score += Math.min(expiredCount * 30, 60);
  score += expiringCount * 10;

  const latest = getLatestCompletedInspection(project.id, data);
  if (latest) {
    const lastDate = new Date(latest.completed_at || latest.started_at).getTime();
    if (now.getTime() - lastDate > 30 * DAY_MS) score += 20;
    if ((latest.safety_score ?? 100) < 50) score += 30;
  } else {
    const created = new Date(project.created_at).getTime();
    if (now.getTime() - created > 30 * DAY_MS) score += 20;
  }

  score = Math.min(score, 100);
  const level: AlertSeverity = score >= 50 ? "high" : score >= 20 ? "medium" : "low";
  return { score, level };
}

/**
 * Tailwind color classes for a severity level.
 */
export function severityColors(severity: AlertSeverity): {
  dot: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case "high":
      return { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    case "medium":
      return { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "low":
      return { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  }
}
