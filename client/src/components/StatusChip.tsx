import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "neutral";

const variantStyles: Record<StatusType, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
};

interface StatusChipProps {
  status: string;
  variant?: StatusType;
  className?: string;
}

export function StatusChip({ status, variant = "neutral", className }: StatusChipProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
      variantStyles[variant],
      className
    )}>
      {status}
    </span>
  );
}
