import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
import { StatusBadge } from "@/components/StatusBadge";
import type { ScanRecord } from "@/types";
import { cn } from "@/lib/utils";

export function ScanHistoryTable({ scans }: { scans: ScanRecord[] | null }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Device</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Response Time</TableHead>
            <TableHead className="text-right">Open Ports</TableHead>
            <TableHead>Scan Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans === null ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : scans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                No scan history yet.
              </TableCell>
            </TableRow>
          ) : (
            scans.map((s) => {
              const isOpen = expanded === s.id;
              const openCount = s.ports.filter((p) => p.state === "open").length;
              return (
                <Fragment key={s.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setExpanded(isOpen ? null : s.id)}
                        disabled={s.ports.length === 0}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{s.deviceName}</TableCell>
                    <TableCell className="font-mono text-xs">{s.ip}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {s.status === "offline" ? "—" : `${s.responseTime} ms`}
                    </TableCell>
                    <TableCell className="text-right">{openCount}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {s.scannedAt}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={7} className="p-4">
                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Scanned Ports
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {s.ports.map((p) => (
                            <Badge
                              key={p.port}
                              variant="outline"
                              className={cn(
                                "font-mono text-xs",
                                p.state === "open" && "border-success/30 bg-success/15 text-success",
                                p.state === "closed" && "border-border bg-muted text-muted-foreground",
                                p.state === "filtered" && "border-warning/40 bg-warning/20 text-warning-foreground",
                              )}
                            >
                              Port {p.port} · {p.state}
                              {p.service ? ` (${p.service})` : ""}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}