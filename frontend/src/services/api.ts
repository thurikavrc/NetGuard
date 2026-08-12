import type { Device, DeviceInput, Alert, ScanRecord } from "@/types";

/**
 * Centralized API base URL.
 * Configure via VITE_API_BASE_URL in your environment.
 * Backend: FastAPI + MySQL (already implemented).
 */
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000";

export const API_ENDPOINTS = {
  devices: `${API_BASE_URL}/devices`,
  device: (id: string | number) => `${API_BASE_URL}/devices/${id}`,
  scanDevice: (id: string | number) => `${API_BASE_URL}/scan/${id}`,
  scanAll: `${API_BASE_URL}/scan/all`,
  alerts: `${API_BASE_URL}/alerts`,
  unacknowledgedAlerts: `${API_BASE_URL}/alerts/unacknowledged`,
  acknowledgeAlert: (id: string | number) => `${API_BASE_URL}/alerts/${id}/acknowledge`,
  scanHistory: `${API_BASE_URL}/scan-history`,
  scanHistoryAll: `${API_BASE_URL}/scan/history`,
} as const;

// ---------------------------------------------------------------------------
// Placeholder data — replace with real fetch() calls when wiring the backend.
// ---------------------------------------------------------------------------

const placeholderDevices: Device[] = [
  {
    id: "1",
    name: "Core Router",
    ip: "192.168.1.1",
    description: "Edge gateway router",
    status: "online",
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    name: "File Server",
    ip: "192.168.1.10",
    description: "Primary internal file share",
    status: "online",
    createdAt: "2026-05-12",
  },
  {
    id: "3",
    name: "Reception PC",
    ip: "192.168.1.45",
    description: "Front-desk workstation",
    status: "offline",
    createdAt: "2026-05-14",
  },
  {
    id: "4",
    name: "CCTV NVR",
    ip: "192.168.1.60",
    description: "Surveillance recorder",
    status: "online",
    createdAt: "2026-05-18",
  },
  {
    id: "5",
    name: "Guest Wi-Fi AP",
    ip: "192.168.1.77",
    description: "Lobby access point",
    status: "unknown",
    createdAt: "2026-06-02",
  },
];

const placeholderAlerts: Alert[] = [
  {
    id: "a1",
    type: "Suspicious Traffic",
    deviceName: "Core Router",
    ip: "192.168.1.1",
    message: "Unusual outbound traffic to 185.220.101.5",
    severity: "high",
    acknowledged: false,
    createdAt: "2026-06-29 14:22",
  },
  {
    id: "a2",
    type: "Brute Force",
    deviceName: "File Server",
    ip: "192.168.1.10",
    message: "SSH brute-force attempt detected",
    severity: "critical",
    acknowledged: false,
    createdAt: "2026-06-29 11:08",
  },
  {
    id: "a3",
    type: "Device Offline",
    deviceName: "Reception PC",
    ip: "192.168.1.45",
    message: "Device went offline",
    severity: "medium",
    acknowledged: true,
    createdAt: "2026-06-28 18:51",
  },
  {
    id: "a4",
    type: "Firmware",
    deviceName: "CCTV NVR",
    ip: "192.168.1.60",
    message: "Firmware out of date",
    severity: "low",
    acknowledged: true,
    createdAt: "2026-06-28 09:14",
  },
];

const placeholderScans: ScanRecord[] = [
  {
    id: "s1",
    deviceName: "Core Router",
    ip: "192.168.1.1",
    status: "online",
    responseTime: 4,
    ports: [
      { port: 22, state: "closed" },
      { port: 80, state: "open", service: "http" },
      { port: 443, state: "open", service: "https" },
      { port: 3306, state: "closed" },
    ],
    result: "success",
    openPorts: 4,
    scannedAt: "2026-06-29 14:00",
  },
  {
    id: "s2",
    deviceName: "File Server",
    ip: "192.168.1.10",
    status: "online",
    responseTime: 12,
    ports: [
      { port: 22, state: "open", service: "ssh" },
      { port: 445, state: "open", service: "smb" },
      { port: 3306, state: "open", service: "mysql" },
      { port: 80, state: "closed" },
    ],
    result: "warning",
    openPorts: 9,
    scannedAt: "2026-06-29 13:55",
  },
  {
    id: "s3",
    deviceName: "Reception PC",
    ip: "192.168.1.45",
    status: "offline",
    responseTime: 0,
    ports: [],
    result: "failed",
    openPorts: 0,
    scannedAt: "2026-06-29 13:42",
  },
  {
    id: "s4",
    deviceName: "CCTV NVR",
    ip: "192.168.1.60",
    status: "online",
    responseTime: 8,
    ports: [
      { port: 80, state: "open", service: "http" },
      { port: 554, state: "open", service: "rtsp" },
      { port: 443, state: "open", service: "https" },
      { port: 22, state: "closed" },
    ],
    result: "success",
    openPorts: 3,
    scannedAt: "2026-06-29 13:30",
  },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getDevices(): Promise<Device[]> {
  const res = await fetch(API_ENDPOINTS.devices);

  if (!res.ok) {
    throw new Error("Failed to fetch devices");
  }

  const data = await res.json();

  return data.map((d: any) => ({
    id: String(d.id),
    name: d.name,
    ip: d.ip_address,
    description: d.description ?? "",
    status: "unknown",
    createdAt: d.created_at?.slice(0, 10) ?? "",
  }));
}

export async function createDevice(input: DeviceInput): Promise<Device> {
  const res = await fetch(API_ENDPOINTS.devices, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      ip_address: input.ip,
      description: input.description,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create device");
  }

  const d = await res.json();

  return {
    id: String(d.id),
    name: d.name,
    ip: d.ip_address,
    description: d.description ?? "",
    status: "unknown",
    createdAt: d.created_at?.slice(0, 10) ?? "",
  };
}


export async function updateDevice(
  id: string,
  input: DeviceInput,
): Promise<Device> {
  await delay();
  return {
    id,
    name: input.name,
    ip: input.ip,
    description: input.description,
    status: "unknown",
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export async function deleteDevice(id: string): Promise<{ id: string }> {
  await delay();
  return { id };
}

export async function scanDevice(id: string): Promise<{ id: string; ok: true }> {
  await delay(500);
  return { id, ok: true };
}

export async function scanAllDevices(): Promise<{ ok: true; count: number }> {
  await delay(800);
  return { ok: true, count: placeholderDevices.length };
}

export async function getRecentAlerts(): Promise<Alert[]> {
  await delay();
  return placeholderAlerts;
}

export async function getRecentScans(): Promise<ScanRecord[]> {
  await delay();
  return placeholderScans;
}

export async function getAlerts(): Promise<Alert[]> {
  await delay();
  return placeholderAlerts;
}

export async function getUnacknowledgedAlerts(): Promise<Alert[]> {
  await delay();
  return placeholderAlerts.filter((a) => !a.acknowledged);
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  await delay();
  const found = placeholderAlerts.find((a) => a.id === id);
  if (found) found.acknowledged = true;
  return { ...(found as Alert), acknowledged: true };
}

export async function getScanHistory(): Promise<ScanRecord[]> {
  await delay();
  return placeholderScans;
}