export interface Vessel {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Warning' | 'Critical';
  image?: string;
  owner: string;
  vtsActive: boolean;
  emsActive: boolean;
  fmsActive: boolean;
  vesselKey: string;
  position: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  rpmPortside: number;
  rpmStarboard: number;
  rpmCenter: number;
  fuelConsumption: number;
  lastUpdate: Date;
}

export interface User {
  username: string;
  password: string;
  role: string;
}

export interface DashboardStats {
  totalVessels: number;
  activeVessels: number;
  warningCount: number;
  criticalCount: number;
}
export interface HistoryRecord {
  id: string;
  vesselId: string;
  vesselName: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  rpmPortside: number;
  rpmStarboard: number;
  rpmCenter: number;
}