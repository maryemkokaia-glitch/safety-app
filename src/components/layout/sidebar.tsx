"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useDemo } from "@/lib/demo-context";
import {
  Shield, LayoutDashboard, FolderOpen, Users, ClipboardList, BookOpen, History,
  Menu, X, RefreshCw, Globe, Settings,
} from "lucide-react";
import { useState } from "react";
import type { TranslationKey } from "@/lib/i18n";

interface NavItem { labelKey: TranslationKey; href: string; icon: React.ReactNode; }

const adminNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { labelKey: "nav.projects", href: "/admin/projects", icon: <FolderOpen className="w-5 h-5" /> },
  { labelKey: "nav.templates", href: "/admin/templates", icon: <ClipboardList className="w-5 h-5" /> },
  { labelKey: "nav.regulations", href: "/admin/regulations", icon: <BookOpen className="w-5 h-5" /> },
  { labelKey: "nav.users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
];
const inspectorNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/inspector", icon: <LayoutDashboard className="w-5 h-5" /> },
  { labelKey: "nav.history", href: "/inspector/history", icon: <History className="w-5 h-5" /> },
  { labelKey: "nav.regulations", href: "/inspector/regulations", icon: <BookOpen className="w-5 h-5" /> },
];
const clientNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/client", icon: <LayoutDashboard className="w-5 h-5" /> },
];

export function Sidebar() {
  const { user, role, lang, setRole, setLang, reset, t } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === "admin" ? adminNav : role === "inspector" ? inspectorNav : clientNav;
  // Show max 5 items in bottom bar
  const bottomNavItems = navItems.slice(0, 5);

  function handleRoleSwitch(newRole: "admin" | "inspector" | "client") {
    setRole(newRole);
    setMobileOpen(false);
    router.push(`/${newRole}`);
  }

  const fullSidebar = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-gray-900 block leading-tight">SafetyApp</span>
          <span className="text-[10px] text-gray-400">{t(`role.${role}` as TranslationKey)}</span>
        </div>
        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold ml-auto">DEMO</span>
      </div>

      {/* Language */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex gap-1.5">
          <button onClick={() => setLang("ka")}
            className={cn("flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
              lang === "ka" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}>ქართული</button>
          <button onClick={() => setLang("en")}
            className={cn("flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
              lang === "en" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}>English</button>
        </div>
      </div>

      {/* Role switcher */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] uppercase text-gray-400 font-bold mb-2">{t("switch_role")}</p>
        <div className="flex gap-1.5">
          {(["admin", "inspector", "client"] as const).map((r) => (
            <button key={r} onClick={() => handleRoleSwitch(r)}
              className={cn("flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all",
                role === r ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}>
              {t(`role.${r === "admin" ? "admin_short" : r}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
              )}>
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* User + Reset */}
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
        <button onClick={() => { reset(); router.push("/admin"); setMobileOpen(false); }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 w-full">
          <RefreshCw className="w-4 h-4 shrink-0" /> {t("reset_data")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">SafetyApp</span>
          </div>
          <button onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden safe-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[56px] transition-all",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}>
                <div className={cn("p-1 rounded-lg", isActive && "bg-blue-50")}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile settings drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[280px] bg-white flex flex-col shadow-2xl rounded-l-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-xl hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {fullSidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {fullSidebar}
      </aside>
    </>
  );
}
