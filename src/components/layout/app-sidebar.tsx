"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useDemo } from "@/lib/demo-context";
import { X, RefreshCw, Settings, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LogoIcon, LogoFull } from "@/components/ui/logo";
import type { TranslationKey } from "@/lib/i18n";

export interface NavItem {
  labelKey: TranslationKey;
  href: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  navItems: NavItem[];
  roleLabelKey: TranslationKey;
  accentColor: { bg: string; text: string; avatarBg: string; avatarText: string };
  basePath: string;
  extraDesktopContent?: React.ReactNode;
  extraDrawerContent?: React.ReactNode;
  resetPath: string;
}

export function AppSidebar({
  navItems,
  roleLabelKey,
  accentColor,
  basePath,
  extraDesktopContent,
  extraDrawerContent,
  resetPath,
}: AppSidebarProps) {
  const { user, lang, setLang, reset, t } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 lg:hidden">
        <div className="flex items-center justify-between px-4 h-13">
          <div className="flex items-center gap-2.5">
            <LogoIcon size="sm" />
            <div>
              <span className="text-sm font-black text-gray-900 tracking-tight">Sar<span className="text-orange-500">ke</span></span>
              <span className="text-[10px] text-gray-400 ml-1.5">{t(roleLabelKey)}</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(true)} aria-label={t("settings")}
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 lg:hidden safe-bottom" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn("flex flex-col items-center gap-1 px-4 py-2 rounded-2xl min-w-[64px] transition-all",
                  isActive ? "text-navy-800" : "text-gray-400"
                )}>
                <div className={cn("p-1.5 rounded-xl transition-colors", isActive && "bg-orange-50")}>
                  {item.icon}
                </div>
                <span className={cn("text-[10px] font-semibold", isActive && "text-navy-800")}>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile settings drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[300px] bg-white flex flex-col shadow-2xl rounded-l-3xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h2 className="text-lg font-bold text-gray-900">{t("settings")}</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"
                className="p-2 rounded-xl hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User card */}
            <div className="px-5 pb-4">
              <div className={cn("flex items-center gap-3 rounded-2xl p-4", accentColor.bg)}>
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0", accentColor.avatarBg)}>
                  {user.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                  <p className={cn("text-xs font-medium", accentColor.text)}>{t(roleLabelKey)}</p>
                </div>
              </div>
            </div>

            {/* Language toggle */}
            <div className="px-5 pb-4">
              <p className="text-xs uppercase text-gray-400 font-bold mb-2.5 tracking-wider">{t("language")}</p>
              <div className="flex gap-2">
                <button onClick={() => setLang("ka")}
                  className={cn("flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
                    lang === "ka" ? "bg-navy-800 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}>ქართული</button>
                <button onClick={() => setLang("en")}
                  className={cn("flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
                    lang === "en" ? "bg-navy-800 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}>English</button>
              </div>
            </div>

            {extraDrawerContent && (
              <div className="px-5 pb-4">{extraDrawerContent}</div>
            )}

            <div className="flex-1" />

            {/* Reset */}
            <div className="px-5 py-5 border-t border-gray-100">
              <button onClick={() => { reset(); router.push(resetPath); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 w-full transition-colors">
                <RefreshCw className="w-4 h-4 shrink-0" />
                {t("reset_data")}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
          <LogoFull size="sm" />
          <span className="text-[10px] text-gray-400 ml-auto">{t(roleLabelKey)}</span>
        </div>
        <nav className="flex-1 px-3 py-3 overflow-y-auto" aria-label="Desktop navigation">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive ? "bg-orange-50 text-navy-800 font-semibold" : "text-gray-600 hover:bg-gray-100"
                  )}>
                  {item.icon}
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          {extraDesktopContent}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-navy-800/10 rounded-full flex items-center justify-center text-xs font-bold text-navy-800 shrink-0">
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
