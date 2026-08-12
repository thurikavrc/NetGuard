export type DeviceStatus = "online" | "offline" | "unknown";

export interface Device {
  id: string;
  name: string;
  ip: string;
  description: string;
  status: DeviceStatus;
  createdAt: string;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: string;
  type: string;
  deviceName: string;
  ip: string;
  message: string;
  severity: AlertSeverity;
  acknowledged: boolean;
  createdAt: string;
}

export interface PortInfo {
  port: number;
  state: "open" | "closed" | "filtered";
  service?: string;
}

export interface ScanRecord {
  id: string;
  deviceName: string;
  ip: string;
  status: DeviceStatus;
  responseTime: number; // ms
  ports: PortInfo[];
  result: "success" | "failed" | "warning";
  openPorts: number;
  scannedAt: string;
}

export interface DeviceInput {
  name: string;
  ip: string;
  description: string;
}