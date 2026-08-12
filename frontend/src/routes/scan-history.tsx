import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { ScanHistoryTable } from "@/components/ScanHistoryTable";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getScanHistory } from "@/services/api";
import type { DeviceStatus, ScanRecord } from "@/types";

type StatusFilter = "all" | DeviceStatus;

export const Route = createFileRoute("/scan-history")({
  head: () => ({
    meta: [
      { title: "Scan History — NetGuard" },
      { name: "description", content: "History of network scans performed by NetGuard." },
    ],
  }),
  component: ScanHistoryPage,
});

function ScanHistoryPage() {
  const [scans, setScans] = useState<ScanRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    void getScanHistory().then(setScans);
  }, []);

  const filtered = useMemo(() => {
    if (scans === null) return null;
    return scans.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return s.deviceName.toLowerCase().includes(q) || s.ip.toLowerCase().includes(q);
    });
  }, [scans, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan History"
        description="History of all device scans across your network."
      />
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar value={query} onChange={setQuery} placeholder="Search device or IP…" />
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered !== null && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">No scans match your filters.</p>
            </div>
          ) : (
            <ScanHistoryTable scans={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}