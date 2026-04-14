"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "./client";
import { useAuth } from "./auth-context";
import type { User, UserRole } from "../database.types";
import type { AppData } from "../store";
import { t as translate, type Lang, type TranslationKey } from "../i18n";
import { generateId } from "../store";
import { syncTemplateChanges } from "./sync-templates";
import { DemoContext } from "../demo-context";

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [lang, setLangState] = useState<Lang>("ka");
  const supabase = createClient();
  const [data, setData] = useState<AppData | null>(null);

  const userId = authUser?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !userId) return;
    setData((prev) => prev || makeEmptyData(authUser, lang));
    fetchAllData();
  }, [userId, authLoading]);

  async function fetchAllData() {
    if (!authUser) return;

    try {
      const results = await Promise.allSettled([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("checklist_templates").select("*, items:checklist_template_items(*)").order("created_at"),
        supabase.from("inspections")
          .select("*, items:inspection_items(*, photos:inspection_photos(*), template_item:checklist_template_items(*))")
          .order("started_at", { ascending: false }),
        supabase.from("regulations").select("*").order("created_at"),
        supabase.from("notifications").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);

      const getData = (idx: number, name: string) => {
        const r = results[idx];
        if (r.status === "rejected") { console.error(`Failed to fetch ${name}:`, r.reason); return []; }
        if (r.value.error) { console.error(`Error fetching ${name}:`, r.value.error.message); return []; }
        return r.value.data || [];
      };

      const projects = getData(0, "projects");
      const templates = getData(1, "templates");
      const inspections = getData(2, "inspections");
      const regulations = getData(3, "regulations");
      const notifications = getData(4, "notifications");
      const users = getData(5, "profiles");

      setData({
        lang,
        currentRole: (authUser.role as UserRole) || "inspector",
        currentUser: authUser,
        projects,
        templates: templates.map((t: any) => ({
          ...t, items: (t.items || []).sort((a: any, b: any) => a.order_index - b.order_index),
        })),
        inspections: inspections.map((insp: any) => ({
          ...insp, items: (insp.items || []).map((item: any) => ({
            ...item, template_item: item.template_item || null, photos: item.photos || [],
          })),
        })),
        regulations,
        notifications,
        documents: [],
        users,
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setData(makeEmptyData(authUser, lang));
    }
  }

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    setData((prev) => prev ? { ...prev, lang: newLang } : prev);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setData((prev) => prev ? { ...prev, currentRole: role } : prev);
  }, []);

  const updateData = useCallback((updater: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...updater(prev) };
      if (prev.templates !== next.templates) {
        queueMicrotask(() => syncTemplateChanges(prev, next));
      }
      return next;
    });
  }, []);

  const refresh = useCallback(() => { fetchAllData(); }, [userId]);
  const reset = useCallback(() => { fetchAllData(); }, [userId]);

  const t_fn = useCallback((key: TranslationKey) => translate(key, lang), [lang]);

  const contextValue = useMemo(() => {
    if (!data || !authUser) return null;
    return { data, user: authUser, role: data.currentRole, lang, setRole, setLang, updateData, refresh, reset, t: t_fn };
  }, [data, authUser, lang, t_fn, setRole, setLang, updateData, refresh, reset]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800" />
      </div>
    );
  }

  if (!authUser) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  if (!data || !contextValue) return null;

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

export { generateId };

function makeEmptyData(user: User, lang: Lang): AppData {
  return {
    lang,
    currentRole: (user.role as UserRole) || "inspector",
    currentUser: user,
    projects: [], templates: [], inspections: [], regulations: [], notifications: [], documents: [], users: [],
  };
}
