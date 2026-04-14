import { ContentStatus, STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STATUS_DOT_COLORS[status])} />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
