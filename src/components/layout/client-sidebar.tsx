"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import { LayoutDashboard, FolderOpen, ClipboardCheck, Users, ChevronRight } from "lucide-react";
import { AppSidebar, type NavItem } from "./app-sidebar";

const clientNav: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/client", icon: <LayoutDashboard className="w-5 h-5" /> },
  { labelKey: "client.my_projects", href: "/client/projects", icon: <FolderOpen className="w-5 h-5" /> },
  { labelKey: "client.experts", href: "/client/experts", icon: <Users className="w-5 h-5" /> },
  { labelKey: "client.reports", href: "/client/reports", icon: <ClipboardCheck className="w-5 h-5" /> },
];

const accentColor = {
  bg: "bg-blue-50",
  text: "text-blue-600",
  avatarBg: "bg-blue-600",
  avatarText: "text-blue-600",
};

export function ClientSidebar() {
  const { setRole, t } = useDemo();
  const router = useRouter();

  const switchToInspector = () => {
    setRole("inspector");
    router.push("/inspector");
  };

  const roleSwitcher = (
    <>
      <p className="text-xs uppercase text-gray-400 font-bold mb-2.5 tracking-wider">{t("switch_role")}</p>
      <button onClick={switchToInspector}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 w-full transition-colors border border-gray-200">
        <ClipboardCheck className="w-4 h-4 shrink-0" />
        {t("role.inspector")}
        <ChevronRight className="w-4 h-4 ml-auto" />
      </button>
    </>
  );

  return (
    <AppSidebar
      navItems={clientNav}
      roleLabelKey="role.client"
      accentColor={accentColor}
      basePath="/client"
      resetPath="/client"
      extraDrawerContent={roleSwitcher}
      extraDesktopContent={
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] uppercase text-gray-400 font-bold mb-2 px-3 tracking-wider">{t("switch_role")}</p>
          <button onClick={switchToInspector}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 w-full transition-all">
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            {t("role.inspector")}
          </button>
        </div>
      }
    />
  );
}
