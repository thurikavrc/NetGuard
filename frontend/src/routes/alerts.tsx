import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { AlertTable } from "@/components/AlertTable";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { acknowledgeAlert, getAlerts } from "@/services/api";
import type { Alert } from "@/types";

type FilterValue = "all" | "acknowledged" | "unacknowledged";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — NetGuard" },
      { name: "description", content: "Security alerts triggered across your monitored devices." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [ackId, setAckId] = useState<string | null>(null);

  useEffect(() => {
    void getAlerts().then(setAlerts);
  }, []);

  const filtered = useMemo(() => {
    if (alerts === null) return null;
    return alerts.filter((a) => {
      if (filter === "acknowledged" && !a.acknowledged) return false;
      if (filter === "unacknowledged" && a.acknowledged) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        a.type.toLowerCase().includes(q) ||
        a.deviceName.toLowerCase().includes(q) ||
        a.ip.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q)
      );
    });
  }, [alerts, query, filter]);

  const handleAcknowledge = async (alert: Alert) => {
    setAckId(alert.id);
    try {
      await acknowledgeAlert(alert.id);
      setAlerts((prev) =>
        prev?.map((a) => (a.id === alert.id ? { ...a, acknowledged: true } : a)) ?? null,
      );
      toast.success(`Acknowledged alert on ${alert.deviceName}`);
    } catch {
      toast.error("Failed to acknowledge alert");
    } finally {
      setAckId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Security alerts triggered across your network."
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar value={query} onChange={setQuery} placeholder="Search alerts…" />
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All alerts</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered !== null && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">No alerts match your filters.</p>
            </div>
          ) : (
            <AlertTable
              alerts={filtered}
              onAcknowledge={handleAcknowledge}
              acknowledgingId={ackId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}