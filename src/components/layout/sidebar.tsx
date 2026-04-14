"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { LayoutDashboard, FolderOpen, ClipboardList, BookOpen, History } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { AppSidebar, type NavItem } from "./app-sidebar";

const inspectorNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/inspector", icon: <LayoutDashboard className="w-5 h-5" /> },
  { labelKey: "nav.templates", href: "/inspector/templates", icon: <ClipboardList className="w-5 h-5" /> },
  { labelKey: "nav.history", href: "/inspector/history", icon: <History className="w-5 h-5" /> },
  { labelKey: "nav.regulations", href: "/inspector/regulations", icon: <BookOpen className="w-5 h-5" /> },
];

const accentColor = {
  bg: "bg-orange-50",
  text: "text-navy-800",
  avatarBg: "bg-navy-800",
  avatarText: "text-navy-800",
};

export function Sidebar() {
  const { data, t } = useDemo();
  const pathname = usePathname();
  const activeProjects = data.projects.filter((p) => p.status === "active");

  return (
    <AppSidebar
      navItems={inspectorNav}
      roleLabelKey="role.inspector"
      accentColor={accentColor}
      basePath="/inspector"
      resetPath="/inspector"
      extraDesktopContent={
        activeProjects.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] uppercase text-gray-400 font-bold mb-2 px-3 tracking-wider">{t("dashboard.my_projects")}</p>
            <div className="space-y-0.5">
              {activeProjects.map((project) => {
                const isActive = pathname === `/inspector/project/${project.id}`;
                return (
                  <Link key={project.id} href={`/inspector/project/${project.id}`}
                    className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
                      isActive ? "bg-orange-50 text-navy-800 font-semibold" : "text-gray-500 hover:bg-gray-100"
                    )}>
                    <FolderOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : undefined
      }
    />
  );
}
