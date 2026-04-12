import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  current: string;
}

export function Breadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 mb-1 min-h-[24px] overflow-x-auto">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1 shrink-0">
          <Link
            href={item.href}
            className="hover:text-navy-800 transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
        </span>
      ))}
      <span className="text-gray-500 font-medium truncate">{current}</span>
    </nav>
  );
}
