"use client";

import { User, Notification, UserRole, TemplateWithItems, InspectionWithItems, Project, Regulation, ProjectDocument } from "./database.types";
import { getDefaultData, demoAdmin, demoInspector, demoClient } from "./demo-data";

// Re-export for backwards compatibility
export { DEMO_COMPANY_ID, demoRegulations } from "./demo-data";

// =============================================
// Data Store — everything in localStorage
// User data is NEVER overwritten. Seed updates are merged in by ID.
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

/**
 * Merge an array of default items into a user array, by id.
 * - Items already present in the user array are KEPT (user wins).
 * - Items missing from the user array are APPENDED.
 * Never deletes or overwrites.
 */
function mergeById<T extends { id: string }>(userItems: T[] | undefined, defaults: T[]): T[] {
  const existing = Array.isArray(userItems) ? userItems : [];
  const existingIds = new Set(existing.map((i) => i.id));
  const missing = defaults.filter((d) => !existingIds.has(d.id));
  if (missing.length === 0) return existing;
  return [...existing, ...missing];
}

/**
 * Additive merge of defaults into user data. Never overwrites anything
 * the user has created or modified.
 */
function mergeWithDefaults(data: AppData, defaults: AppData): AppData {
  return {
    // Scalars — keep user values if present
    lang: data.lang || defaults.lang,
    currentRole: data.currentRole || defaults.currentRole,
    currentUser: data.currentUser || defaults.currentUser,
    // Collections — additive merge by id
    projects: mergeById(data.projects, defaults.projects),
    templates: mergeById(data.templates, defaults.templates),
    inspections: mergeById(data.inspections, defaults.inspections),
    regulations: mergeById(data.regulations, defaults.regulations),
    notifications: mergeById(data.notifications, defaults.notifications),
    documents: mergeById(data.documents, defaults.documents),
    users: mergeById(data.users, defaults.users),
  };
}

/**
 * One-off data migrations (mutate values that are no longer valid in the
 * current schema). Must only change invalid values — never touch anything
 * the user has legitimately set.
 */
function migrateLegacyData(data: AppData): AppData {
  let touched = false;
  const inspections = data.inspections.map((insp) => {
    let itemTouched = false;
    const items = (insp.items || []).map((item: any) => {
      // Old "warning" status no longer exists in the type — downgrade to "violation"
      if (item.status === "warning") {
        itemTouched = true;
        touched = true;
        return { ...item, status: "violation" };
      }
      return item;
    });
    return itemTouched ? { ...insp, items } : insp;
  });
  return touched ? { ...data, inspections } : data;
}

export function loadData(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  const defaults = getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      // 1) Migrate legacy invalid values (warning → violation)
      const migrated = migrateLegacyData(parsed);
      // 2) Additive merge new seed items (never overwrites user data)
      const merged = mergeWithDefaults(migrated, defaults);
      saveData(merged);
      return merged;
    }
  } catch (e) {
    console.warn("Failed to parse localStorage, falling back to defaults", e);
  }
  // First run — seed defaults
  saveData(defaults);
  return defaults;
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage", e);
  }
}

/**
 * Explicit user-triggered reset. Wipes localStorage and reloads seed data.
 * This is the ONLY code path that erases user content.
 */
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
