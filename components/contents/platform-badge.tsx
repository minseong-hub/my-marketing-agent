import { Platform, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        PLATFORM_COLORS[platform],
        className
      )}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

interface PlatformBadgeListProps {
  platforms: Platform[];
  maxShow?: number;
  className?: string;
}

export function PlatformBadgeList({
  platforms,
  maxShow = 3,
  className,
}: PlatformBadgeListProps) {
  const shown = platforms.slice(0, maxShow);
  const rest = platforms.length - maxShow;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {shown.map((p) => (
        <PlatformBadge key={p} platform={p} />
      ))}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">
          +{rest}
        </span>
      )}
    </div>
  );
}
