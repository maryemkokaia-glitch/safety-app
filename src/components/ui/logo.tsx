interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LogoIcon({ size = "md", className }: LogoProps) {
  const dims = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-16 h-16" }[size];

  return (
    <div className={`${dims} rounded-xl overflow-hidden ${className ?? ""}`}>
      <svg viewBox="0 0 512 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect rx="96" width="512" height="512" fill="#1a365d"/>
        <path d="M256 96 L352 224 L256 224 Z" fill="#f59e0b"/>
        <path d="M256 224 L160 352 L256 352 Z" fill="#f59e0b" opacity="0.5"/>
        <rect x="160" y="218" width="192" height="12" rx="6" fill="white" opacity="0.3"/>
        <text x="256" y="456" textAnchor="middle" fill="white" fontSize="96" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-4">S</text>
      </svg>
    </div>
  );
}

export function LogoFull({ size = "md", className }: LogoProps) {
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoIcon size={size} />
      <span className={`${textSize} font-black text-gray-900 tracking-tight`}>
        Sar<span className="text-orange-500">ke</span>
      </span>
    </div>
  );
}
