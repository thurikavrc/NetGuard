import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SeverityBadge } from "@/components/StatusBadge";
import type { Alert } from "@/types";

interface AlertTableProps {
  alerts: Alert[] | null;
  onAcknowledge?: (alert: Alert) => void;
  acknowledgingId?: string | null;
}

export function AlertTable({ alerts, onAcknowledge, acknowledgingId }: AlertTableProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alert Type</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts === null ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={8}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : alerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                No alerts found.
              </TableCell>
            </TableRow>
          ) : (
            alerts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.type}</TableCell>
                <TableCell>{a.deviceName}</TableCell>
                <TableCell className="font-mono text-xs">{a.ip}</TableCell>
                <TableCell className="max-w-[280px] truncate text-muted-foreground">
                  {a.message}
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={a.severity} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {a.createdAt}
                </TableCell>
                <TableCell>
                  {a.acknowledged ? (
                    <Badge variant="outline" className="border-success/30 bg-success/15 text-success">
                      Acknowledged
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning/40 bg-warning/20 text-warning-foreground">
                      Unacknowledged
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!a.acknowledged && onAcknowledge && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcknowledge(a)}
                      disabled={acknowledgingId === a.id}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Acknowledge
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}