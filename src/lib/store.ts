"use client";

import { User, Notification, UserRole, TemplateWithItems, InspectionWithItems, Project, Regulation, ProjectDocument } from "./database.types";
import { getDefaultData, demoAdmin, demoInspector, demoClient } from "./demo-data";

// Re-export for backwards compatibility
export { DEMO_COMPANY_ID, demoRegulations } from "./demo-data";

// =============================================
// Data Store — everything in localStorage
// =============================================

const STORAGE_KEY = "safety_app_data";

export interface AppData {
  lang: "ka" | "en";
  currentRole: UserRole;
  currentUser: User;
  projects: Project[];
  templates: TemplateWithItems[];
  inspections: InspectionWithItems[];
  regulations: Regulation[];
  notifications: Notification[];
  documents: ProjectDocument[];
  users: User[];
}

// Migration: old "warning" status → "violation"; ensure documents array exists
function migrateLegacyData(data: AppData): AppData {
  let migrated = false;
  const inspections = data.inspections.map((insp) => {
    const items = insp.items.map((item: any) => {
      if (item.status === "warning") {
        migrated = true;
        return { ...item, status: "violation" };
      }
      return item;
    });
    return migrated ? { ...insp, items } : insp;
  });
  let result = migrated ? { ...data, inspections } : data;
  // Ensure documents array exists (older localStorage won't have it)
  if (!Array.isArray((result as any).documents)) {
    const defaults = getDefaultData();
    result = { ...result, documents: defaults.documents };
  }
  return result;
}

export function loadData(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let data: AppData = JSON.parse(raw);
      // Merge any new default regulations not yet in localStorage
      const defaults = getDefaultData();
      const existingIds = new Set(data.regulations.map((r) => r.id));
      const missing = defaults.regulations.filter((r) => !existingIds.has(r.id));
      if (missing.length > 0) {
        data.regulations = [...data.regulations, ...missing];
      }
      // Migrate legacy "warning" status
      data = migrateLegacyData(data);
      saveData(data);
      return data;
    }
  } catch {}
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function switchRole(role: UserRole): AppData {
  const data = loadData();
  data.currentRole = role;
  data.currentUser = role === "admin" ? demoAdmin : role === "inspector" ? demoInspector : demoClient;
  saveData(data);
  return data;
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
