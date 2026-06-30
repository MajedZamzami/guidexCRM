import { Badge } from "@/components/ui/badge";
import type { HealthStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const STYLES: Record<HealthStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  at_risk: "bg-warning/15 text-warning border-warning/30",
  cold: "bg-muted text-muted-foreground border-border",
};

const LABELS: Record<HealthStatus, string> = {
  active: "Active",
  at_risk: "At Risk",
  cold: "Cold",
};

export function HealthBadge({ status }: { status: HealthStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", STYLES[status])}>
      {LABELS[status]}
    </Badge>
  );
}
