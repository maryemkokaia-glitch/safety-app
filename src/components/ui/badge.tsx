import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        {
          "bg-gray-100 text-gray-700": variant === "default",
          "bg-green-50 text-green-700 border border-green-200": variant === "success",
          "bg-amber-50 text-amber-700 border border-amber-200": variant === "warning",
          "bg-red-50 text-red-700 border border-red-200": variant === "danger",
          "bg-blue-50 text-blue-700 border border-blue-200": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
