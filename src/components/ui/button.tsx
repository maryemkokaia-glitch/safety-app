import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm": variant === "primary",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500": variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500": variant === "danger",
            "text-gray-700 hover:bg-gray-100 focus:ring-gray-500": variant === "ghost",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500": variant === "outline",
          },
          {
            "px-3 py-2 text-sm min-h-[36px]": size === "sm",
            "px-5 py-2.5 text-sm min-h-[44px]": size === "md",
            "px-6 py-3.5 text-base min-h-[48px]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
