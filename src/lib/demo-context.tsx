"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingDataRef = useRef<AppData | null>(null);

  const debouncedSave = useCallback((newData: AppData) => {
    pendingDataRef.current = newData;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (pendingDataRef.current) saveData(pendingDataRef.current);
    }, 500);
  }, []);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (pendingDataRef.current) saveData(pendingDataRef.current);
    };
  }, []);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    const newData = switchRole(role);
    setData({ ...newData });
  }, []);

  const setLang = useCallback((lang: Lang) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = { ...prev, lang };
      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  const updateData = useCallback((updater: (data: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = updater(prev);
      debouncedSave(newData);
      return { ...newData };
    });
  }, [debouncedSave]);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  const reset = useCallback(() => {
    setData(resetData());
  }, []);

  const translate = useCallback((key: TranslationKey) => t(key, data?.lang ?? "ka"), [data?.lang]);

  const contextValue = useMemo(() => {
    if (!data) return null;
    return {
      data, user: data.currentUser, role: data.currentRole, lang: data.lang,
      setRole, setLang, updateData, refresh, reset, t: translate,
    };
  }, [data, translate, setRole, setLang, updateData, refresh, reset]);

  if (!data || !contextValue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800" />
      </div>
    );
  }

  return (
    <DemoContext.Provider value={contextValue}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

export { generateId };
