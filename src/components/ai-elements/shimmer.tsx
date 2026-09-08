import { cn } from "@/lib/utils";

export function Shimmer({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      {children || <div className="h-4 w-24 rounded bg-muted" />}
    </div>
  );
}
