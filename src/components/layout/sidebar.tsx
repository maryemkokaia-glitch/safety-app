"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useDemo } from "@/lib/demo-context";
import {
  Shield, LayoutDashboard, FolderOpen, Users, ClipboardList, BookOpen, History,
  X, RefreshCw, Settings, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { TranslationKey } from "@/lib/i18n";

interface NavItem { labelKey: TranslationKey; href: string; icon: React.ReactNode; }

const inspectorNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/inspector", icon: <LayoutDashboard className="w-5 h-5" /> },
  { labelKey: "nav.history", href: "/inspector/history", icon: <History className="w-5 h-5" /> },
  { labelKey: "nav.regulations", href: "/inspector/regulations", icon: <BookOpen className="w-5 h-5" /> },
];

export function Sidebar() {
  const { user, role, lang, setRole, setLang, reset, t } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Always use inspector nav on mobile
  const navItems = inspectorNav;
  const bottomNavItems = navItems.slice(0, 5);

  // Force inspector role on mount if not already
  useEffect(() => {
    if (role !== "inspector") {
      setRole("inspector");
    }
  }, [role, setRole]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 lg:hidden">
        <div className="flex items-center justify-between px-4 h-13">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900">SafetyApp</span>
              <span className="text-[10px] text-gray-400 ml-1.5">{t("role.inspector")}</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Mobile bottom navigation — clean tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 lg:hidden safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/inspector" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-2xl min-w-[64px] transition-all",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}>
                <div className={cn("p-1.5 rounded-xl transition-colors", isActive && "bg-blue-50")}>
                  {item.icon}
                </div>
                <span className={cn("text-[10px] font-semibold", isActive && "text-blue-600")}>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile settings drawer — slide from right */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[300px] bg-white flex flex-col shadow-2xl rounded-l-3xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h2 className="text-lg font-bold text-gray-900">{t("settings")}</h2>
              <button onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User card */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4">
                <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                  <p className="text-xs text-blue-600 font-medium">{t("role.inspector")}</p>
                </div>
              </div>
            </div>

            {/* Language toggle */}
            <div className="px-5 pb-4">
              <p className="text-xs uppercase text-gray-400 font-bold mb-2.5 tracking-wider">{t("language")}</p>
              <div className="flex gap-2">
                <button onClick={() => setLang("ka")}
                  className={cn("flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
                    lang === "ka" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}>🇬🇪 ქართული</button>
                <button onClick={() => setLang("en")}
                  className={cn("flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
                    lang === "en" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}>🇬🇧 English</button>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Reset */}
            <div className="px-5 py-5 border-t border-gray-100">
              <button onClick={() => { reset(); router.push("/inspector"); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 w-full transition-colors">
                <RefreshCw className="w-4 h-4 shrink-0" />
                {t("reset_data")}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 block leading-tight">SafetyApp</span>
            <span className="text-[10px] text-gray-400">{t("role.inspector")}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/inspector" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                )}>
                {item.icon}
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
