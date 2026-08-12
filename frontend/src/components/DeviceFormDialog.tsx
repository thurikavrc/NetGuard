import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Device, DeviceInput } from "@/types";

interface DeviceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDevice?: Device | null;
  onSubmit: (input: DeviceInput) => Promise<void> | void;
}

export function DeviceFormDialog({
  open,
  onOpenChange,
  initialDevice,
  onSubmit,
}: DeviceFormDialogProps) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialDevice);

  useEffect(() => {
    if (open) {
      setName(initialDevice?.name ?? "");
      setIp(initialDevice?.ip ?? "");
      setDescription(initialDevice?.description ?? "");
    }
  }, [open, initialDevice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), ip: ip.trim(), description: description.trim() });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit device" : "Add device"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this device's details."
              : "Register a new device to monitor on your network."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device name</Label>
            <Input
              id="device-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Router"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-ip">IP address</Label>
            <Input
              id="device-ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-desc">Description</Label>
            <Textarea
              id="device-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this device"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}