import { Badge } from "@/components/ui/badge";
import type { DeviceStatus, AlertSeverity } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const map: Record<DeviceStatus, string> = {
    online: "bg-success/15 text-success border-success/30",
    offline: "bg-destructive/15 text-destructive border-destructive/30",
    unknown: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", map[status])}>
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          status === "online" && "bg-success",
          status === "offline" && "bg-destructive",
          status === "unknown" && "bg-muted-foreground",
        )}
      />
      {status}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map: Record<AlertSeverity, string> = {
    low: "bg-muted text-muted-foreground border-border",
    medium: "bg-warning/20 text-warning-foreground border-warning/40",
    high: "bg-destructive/15 text-destructive border-destructive/30",
    critical: "bg-destructive text-destructive-foreground border-destructive",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", map[severity])}>
      {severity}
    </Badge>
  );
}

export function ScanResultBadge({ result }: { result: "success" | "failed" | "warning" }) {
  const map = {
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/20 text-warning-foreground border-warning/40",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  return (
    <Badge variant="outline" className={cn("capitalize", map[result])}>
      {result}
    </Badge>
  );
}