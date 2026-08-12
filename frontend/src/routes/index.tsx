import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  HardDrive,
  ShieldAlert,
  WifiOff,
  RefreshCw,
  PieChart,
  BarChart3,
  Signal,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { SeverityBadge, ScanResultBadge } from "@/components/StatusBadge";
import { PlaceholderChart } from "@/components/PlaceholderChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDevices,
  getRecentAlerts,
  getRecentScans,
  scanAllDevices,
} from "@/services/api";
import type { Alert, Device, ScanRecord } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — NetGuard" },
      { name: "description", content: "Overview of devices, alerts and recent scans across your network." },
      { property: "og:title", content: "Dashboard — NetGuard" },
      { property: "og:description", content: "Overview of devices, alerts and recent scans across your network." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [scans, setScans] = useState<ScanRecord[] | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    void getDevices().then(setDevices);
    void getRecentAlerts().then(setAlerts);
    void getRecentScans().then(setScans);
  }, []);

  const total = devices?.length ?? 0;
  const online = devices?.filter((d) => d.status === "online").length ?? 0;
  const offline = devices?.filter((d) => d.status === "offline").length ?? 0;
  const activeAlerts = alerts?.filter((a) => a.severity === "high" || a.severity === "critical").length ?? 0;
  const unknown = devices?.filter((d) => d.status === "unknown").length ?? 0;
  const uptime = total > 0 ? Math.round((online / total) * 100) : 0;
  const unacknowledged = alerts?.filter((a) => !a.acknowledged).length ?? 0;

  const handleScanAll = async () => {
    setScanning(true);
    try {
      const res = await scanAllDevices();
      toast.success(`Scan initiated for ${res.count} devices`);
    } catch {
      toast.error("Failed to start scan");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your monitored network."
        actions={
          <Button onClick={handleScanAll} disabled={scanning}>
            <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning…" : "Scan All Devices"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {devices === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Devices" value={total} icon={HardDrive} tone="default" />
            <StatCard label="Online" value={online} icon={Activity} tone="success" />
            <StatCard label="Offline" value={offline} icon={WifiOff} tone="destructive" />
            <StatCard label="Active Alerts" value={activeAlerts} icon={ShieldAlert} tone="warning" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Network Status</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-semibold tracking-tight">{uptime}%</p>
                <span className="text-xs text-muted-foreground">Uptime</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${uptime}%` }}
                />
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-md bg-success/10 p-2">
                <dt className="text-muted-foreground">Online</dt>
                <dd className="mt-1 text-lg font-semibold text-success">{online}</dd>
              </div>
              <div className="rounded-md bg-destructive/10 p-2">
                <dt className="text-muted-foreground">Offline</dt>
                <dd className="mt-1 text-lg font-semibold text-destructive">{offline}</dd>
              </div>
              <div className="rounded-md bg-muted p-2">
                <dt className="text-muted-foreground">Unknown</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">{unknown}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs">
              <span className="text-warning-foreground">Unacknowledged alerts</span>
              <span className="font-semibold text-warning-foreground">{unacknowledged}</span>
            </div>
          </CardContent>
        </Card>

        <PlaceholderChart
          title="Online vs Offline Devices"
          icon={PieChart}
          variant="donut"
          legend={[
            { label: "Online", color: "hsl(var(--success, 142 71% 45%))", value: online },
            { label: "Offline", color: "hsl(var(--destructive))", value: offline },
            { label: "Unknown", color: "hsl(var(--muted-foreground))", value: unknown },
          ]}
        />

        <PlaceholderChart
          title="Alert Distribution"
          icon={BarChart3}
          variant="bars"
          legend={[
            { label: "Low", color: "hsl(var(--muted-foreground))" },
            { label: "Medium", color: "hsl(var(--warning, 38 92% 50%))" },
            { label: "High", color: "hsl(var(--destructive))" },
            { label: "Critical", color: "hsl(var(--destructive))" },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Alerts</CardTitle>
            <Link to="/alerts" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts === null ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No alerts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.deviceName}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">
                        {a.message}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={a.severity} />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {a.createdAt}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Scan History</CardTitle>
            <Link to="/scan-history" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Open Ports</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans === null ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  scans.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.deviceName}</TableCell>
                      <TableCell>
                        <ScanResultBadge result={s.result} />
                      </TableCell>
                      <TableCell className="text-right">{s.openPorts}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {s.scannedAt}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
