import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DeviceFormDialog } from "@/components/DeviceFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createDevice,
  deleteDevice,
  getDevices,
  scanDevice,
  updateDevice,
} from "@/services/api";
import type { Device, DeviceInput } from "@/types";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices — NetGuard" },
      { name: "description", content: "Manage and scan devices monitored by NetGuard." },
      { property: "og:title", content: "Devices — NetGuard" },
      { property: "og:description", content: "Manage and scan devices monitored by NetGuard." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Device | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);

useEffect(() => {
  const loadDevices = async () => {
    try {
      const data = await getDevices();
      console.log("Devices from API:", data);
      setDevices(data);
    } catch (err) {
      console.error("Error loading devices:", err);
      toast.error("Failed to load devices");
      setDevices([]);
    }
  };

  loadDevices();
}, []);

  const filtered = (devices ?? []).filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.ip.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  });

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (device: Device) => {
    setEditing(device);
    setDialogOpen(true);
  };

  const handleSubmit = async (input: DeviceInput) => {
    if (editing) {
      const updated = await updateDevice(editing.id, input);
      setDevices((prev) =>
        prev?.map((d) => (d.id === editing.id ? { ...d, ...updated } : d)) ?? null,
      );
      toast.success("Device updated");
    } else {
      const created = await createDevice(input);
      setDevices((prev) => (prev ? [created, ...prev] : [created]));
      toast.success("Device added");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteDevice(confirmDelete.id);
    setDevices((prev) => prev?.filter((d) => d.id !== confirmDelete.id) ?? null);
    toast.success(`Deleted ${confirmDelete.name}`);
    setConfirmDelete(null);
  };

  const handleScan = async (device: Device) => {
    setScanningId(device.id);
    try {
      await scanDevice(device.id);
      toast.success(`Scan started for ${device.name}`);
    } catch {
      toast.error("Scan failed");
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        description="All registered devices on your monitored network."
        actions={
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Device
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search devices…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices === null ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No devices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="font-mono text-sm">{d.ip}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-muted-foreground">
                        {d.description}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScan(d)}
                            disabled={scanningId === d.id}
                          >
                            <RefreshCw
                              className={`mr-1 h-4 w-4 ${scanningId === d.id ? "animate-spin" : ""}`}
                            />
                            Scan
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}>
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete(d)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeviceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialDevice={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{confirmDelete?.name}</span>{" "}
              from your monitored devices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}