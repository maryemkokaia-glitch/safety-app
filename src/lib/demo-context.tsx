"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppData, loadData, saveData, switchRole, resetData, generateId } from "./store";
import type { User, UserRole } from "./database.types";
import { t, type Lang, type TranslationKey } from "./i18n";

interface DemoContextType {
  data: AppData;
  user: User;
  role: UserRole;
  lang: Lang;
  setRole: (role: UserRole) => void;
  setLang: (lang: Lang) => void;
  updateData: (updater: (data: AppData) => AppData) => void;
  refresh: () => void;
  reset: () => void;
  t: (key: TranslationKey) => string;
}

export const DemoContext = createContext<DemoContextType>(null!);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const loaded = loadData();
    // Default to inspector role for mobile app
    if (loaded.currentRole !== "inspector") {
      const updated = switchRole("inspector");
      setData({ ...updated });
    } else {
      setData(loaded);
    }
  }, []);

  const setRole = useCallback((role: UserRole) => {
    const newData = switchRole(role);
    setData({ ...newData });
  }, []);

  const setLang = useCallback((lang: Lang) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = { ...prev, lang };
      saveData(newData);
      return newData;
    });
  }, []);

  const updateData = useCallback((updater: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = updater(prev);
      saveData(newData);
      return { ...newData };
    });
  }, []);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  const reset = useCallback(() => {
    setData(resetData());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const translate = (key: TranslationKey) => t(key, data.lang);

  return (
    <DemoContext.Provider value={{ data, user: data.currentUser, role: data.currentRole, lang: data.lang, setRole, setLang, updateData, refresh, reset, t: translate }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

export { generateId };
