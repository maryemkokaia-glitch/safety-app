import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export function PageHeader({ icon: Icon, iconBg, iconColor, title, subtitle, className, action }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-6", className)}>
      <div className={cn("p-2.5 rounded-xl", iconBg)}>
        <Icon className={cn("w-6 h-6", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
