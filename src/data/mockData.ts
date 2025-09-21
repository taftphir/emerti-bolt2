import { Vessel, DashboardStats } from '../types/vessel';
import { HistoryRecord } from '../types/vessel';
import { VesselDatabase, DatabaseVessel } from '../lib/database';

// Convert database vessel to app vessel format
const convertDatabaseVessel = (dbVessel: DatabaseVessel): Vessel => {
  return {
    id: `V${String(dbVessel.id).padStart(3, '0')}`,
    name: dbVessel.name,
    type: dbVessel.vessel_type,
    status: dbVessel.status as 'Active' | 'Inactive' | 'Warning' | 'Critical',
    image: dbVessel.image_url,
    owner: dbVessel.owner,
    vtsActive: dbVessel.vts_active,
    emsActive: dbVessel.ems_active,
    fmsActive: dbVessel.fms_active,
    vesselKey: dbVessel.vessel_key,
    position: {
      lat: dbVessel.latitude || -7.0,
      lng: dbVessel.longitude || 113.8
    },
    speed: dbVessel.speed || 0,
    heading: dbVessel.heading || 0,
    rpmPortside: dbVessel.rpm_portside || 0,
    rpmStarboard: dbVessel.rpm_starboard || 0,
    rpmCenter: dbVessel.rpm_center || 0,
    fuelConsumption: dbVessel.fuel_consumption || 0,
    lastUpdate: dbVessel.updated_at
  };
};

// Fetch vessels from database
export const fetchVesselsFromDatabase = async (): Promise<Vessel[]> => {
  try {
    const dbVessels = await VesselDatabase.getAllVessels();
    return dbVessels.map(convertDatabaseVessel);
  } catch (error) {
    console.error('Error fetching vessels from database:', error);
    // Fallback to mock data if database fails
    return mockVessels;
  }
};

// Generate mock history data first - this will be our primary data source
const generateHistoryData = (): HistoryRecord[] => {
  const records: HistoryRecord[] = [];
  const now = new Date();
  
  // Base vessel data for generating history
  const baseVessels = [
    {
      id: 'V001',
      name: 'Sinar Bahari',
      type: 'Cargo',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Sinar Bahari Shipping',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'SB001-2024-CARGO',
      basePosition: { lat: -6.7, lng: 113.8 },
      baseSpeed: 12.5,
      baseHeading: 135,
      baseRpmPortside: 1850,
      baseRpmStarboard: 1820,
      baseRpmCenter: 1835,
      baseFuelConsumption: 45.2
    },
    {
      id: 'V002',
      name: 'Maritim Jaya',
      type: 'Tanker',
      status: 'Warning' as const,
      image: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'CV Maritim Jaya',
      vtsActive: true,
      emsActive: false,
      fmsActive: true,
      vesselKey: 'MJ002-2024-TANKER',
      basePosition: { lat: -7.0, lng: 114.3 },
      baseSpeed: 8.3,
      baseHeading: 270,
      baseRpmPortside: 1200,
      baseRpmStarboard: 1180,
      baseRpmCenter: 1190,
      baseFuelConsumption: 38.7
    },
    {
      id: 'V003',
      name: 'Ocean Pioneer',
      type: 'Container',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Ocean Pioneer Lines',
      vtsActive: true,
      emsActive: true,
      fmsActive: false,
      vesselKey: 'OP003-2024-CONTAINER',
      basePosition: { lat: -7.4, lng: 113.6 },
      baseSpeed: 15.2,
      baseHeading: 45,
      baseRpmPortside: 2100,
      baseRpmStarboard: 2080,
      baseRpmCenter: 2095,
      baseFuelConsumption: 52.1
    },
    {
      id: 'V004',
      name: 'Nusantara Express',
      type: 'Ferry',
      status: 'Critical' as const,
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Nusantara Ferry',
      vtsActive: false,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'NE004-2024-FERRY',
      basePosition: { lat: -6.9, lng: 112.7 },
      baseSpeed: 5.1,
      baseHeading: 90,
      baseRpmPortside: 800,
      baseRpmStarboard: 820,
      baseRpmCenter: 810,
      baseFuelConsumption: 28.4
    },
    {
      id: 'V005',
      name: 'Bahari Utama',
      type: 'Cargo',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Bahari Utama',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'BU005-2024-CARGO',
      basePosition: { lat: -6.8, lng: 114.0 },
      baseSpeed: 11.2,
      baseHeading: 180,
      baseRpmPortside: 1750,
      baseRpmStarboard: 1730,
      baseRpmCenter: 1740,
      baseFuelConsumption: 42.8
    },
    {
      id: 'V006',
      name: 'Samudra Indah',
      type: 'Tanker',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'CV Samudra Indah',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'SI006-2024-TANKER',
      basePosition: { lat: -7.2, lng: 113.2 },
      baseSpeed: 9.8,
      baseHeading: 315,
      baseRpmPortside: 1400,
      baseRpmStarboard: 1380,
      baseRpmCenter: 1390,
      baseFuelConsumption: 35.5
    },
    {
      id: 'V007',
      name: 'Pelita Laut',
      type: 'Container',
      status: 'Warning' as const,
      image: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Pelita Laut Shipping',
      vtsActive: true,
      emsActive: true,
      fmsActive: false,
      vesselKey: 'PL007-2024-CONTAINER',
      basePosition: { lat: -6.6, lng: 113.5 },
      baseSpeed: 13.7,
      baseHeading: 225,
      baseRpmPortside: 1950,
      baseRpmStarboard: 1920,
      baseRpmCenter: 1935,
      baseFuelConsumption: 48.3
    },
    {
      id: 'V008',
      name: 'Jaya Makmur',
      type: 'Ferry',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Jaya Makmur Ferry',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'JM008-2024-FERRY',
      basePosition: { lat: -7.1, lng: 114.1 },
      baseSpeed: 16.4,
      baseHeading: 60,
      baseRpmPortside: 1650,
      baseRpmStarboard: 1670,
      baseRpmCenter: 1660,
      baseFuelConsumption: 31.2
    }
  ];
  
  baseVessels.forEach((vessel) => {
    // Generate 200 records per vessel over the last 14 days
    for (let i = 0; i < 200; i++) {
      const timestamp = new Date(now.getTime() - (i * 1.5 * 60 * 60 * 1000)); // Every 1.5 hours
      
      // Add some realistic variation to the data
      const timeVariation = Math.sin(i * 0.1) * 0.3; // Cyclical variation
      const randomVariation = (Math.random() - 0.5) * 0.2; // Random variation
      if (vessel.name != 'Sinar Bahari') {
        records.push({
          id: `${vessel.id}-${i}`,
          vesselId: vessel.id,
          vesselName: vessel.name,
          timestamp,
          latitude: vessel.basePosition.lat + (timeVariation + randomVariation) * 0.1,
          longitude: vessel.basePosition.lng + (timeVariation + randomVariation) * 0.1,
          speed: Math.max(0, vessel.baseSpeed + (timeVariation + randomVariation) * 8),
          heading: (vessel.baseHeading + (timeVariation + randomVariation) * 60) % 360,
          rpmPortside: Math.max(0, vessel.baseRpmPortside + (timeVariation + randomVariation) * 400),
          rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (timeVariation + randomVariation) * 400),
          rpmCenter: Math.max(0, vessel.baseRpmCenter + (timeVariation + randomVariation) * 400),
        });
      }
    }

    if (vessel.name=='Sinar Bahari') {
      let timestamp = new Date(now.getTime() - (0 * 2 * 60 * 60 * 1000)); // Every 2 hours
      records.push({
        id: `${vessel.id}-${0}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp,
        latitude: -7.38542,
        longitude: 113.839851,
        speed: Math.max(0, vessel.baseSpeed + (Math.random() - 0.5) * 8),
        heading: Math.floor(Math.random() * 360),
        rpmPortside: Math.max(0, vessel.baseRpmPortside + (Math.random() - 0.5) * 400),
        rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (Math.random() - 0.5) * 400),
        rpmCenter: Math.max(0, vessel.baseRpmCenter + (Math.random() - 0.5) * 400),
      });
      timestamp = new Date(now.getTime() - (1 * 2 * 60 * 60 * 1000)); // Every 2 hours
      records.push({
        id: `${vessel.id}-${1}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp,
        latitude: -7.384068,
        longitude: 113.83886,
        speed: Math.max(0, vessel.baseSpeed + (Math.random() - 0.5) * 8),
        heading: Math.floor(Math.random() * 360),
        rpmPortside: Math.max(0, vessel.baseRpmPortside + (Math.random() - 0.5) * 400),
        rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (Math.random() - 0.5) * 400),
        rpmCenter: Math.max(0, vessel.baseRpmCenter + (Math.random() - 0.5) * 400),
      });
      timestamp = new Date(now.getTime() - (2 * 2 * 60 * 60 * 1000)); // Every 2 hours
      records.push({
        id: `${vessel.id}-${2}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp,
        latitude: -7.243197,
        longitude: 113.812173,
        speed: Math.max(0, vessel.baseSpeed + (Math.random() - 0.5) * 8),
        heading: Math.floor(Math.random() * 360),
        rpmPortside: Math.max(0, vessel.baseRpmPortside + (Math.random() - 0.5) * 400),
        rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (Math.random() - 0.5) * 400),
        rpmCenter: Math.max(0, vessel.baseRpmCenter + (Math.random() - 0.5) * 400),
      });
      timestamp = new Date(now.getTime() - (3 * 2 * 60 * 60 * 1000)); // Every 2 hours
      records.push({
        id: `${vessel.id}-${3}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp,
        latitude: -7.2427197,
        longitude: 113.3032598,
        speed: Math.max(0, vessel.baseSpeed + (Math.random() - 0.5) * 8),
        heading: Math.floor(Math.random() * 360),
        rpmPortside: Math.max(0, vessel.baseRpmPortside + (Math.random() - 0.5) * 400),
        rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (Math.random() - 0.5) * 400),
        rpmCenter: Math.max(0, vessel.baseRpmCenter + (Math.random() - 0.5) * 400),
      });
      timestamp = new Date(now.getTime() - (4 * 2 * 60 * 60 * 1000)); // Every 2 hours
      records.push({
        id: `${vessel.id}-${4}`,
        vesselId: vessel.id,
        vesselName: vessel.name,
        timestamp,
        latitude: -7.2394197,
        longitude: 113.3032598,
        speed: Math.max(0, vessel.baseSpeed + (Math.random() - 0.5) * 8),
        heading: Math.floor(Math.random() * 360),
        rpmPortside: Math.max(0, vessel.baseRpmPortside + (Math.random() - 0.5) * 400),
        rpmStarboard: Math.max(0, vessel.baseRpmStarboard + (Math.random() - 0.5) * 400),
        rpmCenter: Math.max(0, vessel.baseRpmCenter + (Math.random() - 0.5) * 400),
      });
    }
  });
  
  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate the history data once
const historyData = generateHistoryData();

// Create vessels from latest history records
const createVesselsFromHistory = (): Vessel[] => {
  const vesselMap = new Map<string, HistoryRecord>();
  
  // Get the latest record for each vessel
  historyData.forEach(record => {
    if (!vesselMap.has(record.vesselId) || 
        record.timestamp > vesselMap.get(record.vesselId)!.timestamp) {
      vesselMap.set(record.vesselId, record);
    }
  });
  
  // Base vessel info
  const vesselInfo = [
    {
      id: 'V001',
      type: 'Cargo',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Sinar Bahari Shipping',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'SB001-2024-CARGO',
      fuelConsumption: 45.2
    },
    {
      id: 'V002',
      type: 'Tanker',
      status: 'Warning' as const,
      image: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'CV Maritim Jaya',
      vtsActive: true,
      emsActive: false,
      fmsActive: true,
      vesselKey: 'MJ002-2024-TANKER',
      fuelConsumption: 38.7
    },
    {
      id: 'V003',
      type: 'Container',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Ocean Pioneer Lines',
      vtsActive: true,
      emsActive: true,
      fmsActive: false,
      vesselKey: 'OP003-2024-CONTAINER',
      fuelConsumption: 52.1
    },
    {
      id: 'V004',
      type: 'Ferry',
      status: 'Critical' as const,
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Nusantara Ferry',
      vtsActive: false,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'NE004-2024-FERRY',
      fuelConsumption: 28.4
    },
    {
      id: 'V005',
      type: 'Cargo',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Bahari Utama',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'BU005-2024-CARGO',
      fuelConsumption: 42.8
    },
    {
      id: 'V006',
      type: 'Tanker',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'CV Samudra Indah',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'SI006-2024-TANKER',
      fuelConsumption: 35.5
    },
    {
      id: 'V007',
      type: 'Container',
      status: 'Warning' as const,
      image: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Pelita Laut Shipping',
      vtsActive: true,
      emsActive: true,
      fmsActive: false,
      vesselKey: 'PL007-2024-CONTAINER',
      fuelConsumption: 48.3
    },
    {
      id: 'V008',
      type: 'Ferry',
      status: 'Active' as const,
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400',
      owner: 'PT Jaya Makmur Ferry',
      vtsActive: true,
      emsActive: true,
      fmsActive: true,
      vesselKey: 'JM008-2024-FERRY',
      fuelConsumption: 31.2
    }
  ];
  
  return vesselInfo.map(info => {
    const latestRecord = vesselMap.get(info.id);
    if (!latestRecord) {
      throw new Error(`No history record found for vessel ${info.id}`);
    }
    
    return {
      ...info,
      name: latestRecord.vesselName,
      position: {
        lat: latestRecord.latitude,
        lng: latestRecord.longitude
      },
      speed: latestRecord.speed,
      heading: latestRecord.heading,
      rpmPortside: latestRecord.rpmPortside,
      rpmStarboard: latestRecord.rpmStarboard,
      rpmCenter: latestRecord.rpmCenter,
      lastUpdate: latestRecord.timestamp
    };
  });
};

// Export the vessels created from history data
export const mockVessels: Vessel[] = [
  ...createVesselsFromHistory()
];

export const getDashboardStats = (): DashboardStats => {
  return {
    totalVessels: mockVessels.length,
    activeVessels: mockVessels.filter(v => v.status === 'Active').length,
    warningCount: mockVessels.filter(v => v.status === 'Warning').length,
    criticalCount: mockVessels.filter(v => v.status === 'Critical').length
  };
};

// Export the history data
export const getHistoryData = (): HistoryRecord[] => {
  return historyData;
};

// Generate hourly data for charts
export const generateHourlyData = (vessel: Vessel) => {
  // Get last 24 hours of data for this vessel from history
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const vesselHistory = historyData
    .filter(record => record.vesselId === vessel.id && record.timestamp >= yesterday)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const hours: string[] = [];
  const speedData: number[] = [];
  const rpmData: number[] = [];
  const fuelData: number[] = [];

  // Group data by hour
  for (let i = 0; i < 24; i++) {
    const hourStart = new Date(yesterday.getTime() + i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    hours.push(`${i.toString().padStart(2, '0')}:00`);
    
    // Find records in this hour
    const hourRecords = vesselHistory.filter(record => 
      record.timestamp >= hourStart && record.timestamp < hourEnd
    );
    
    if (hourRecords.length > 0) {
      // Average the values for this hour
      const avgSpeed = hourRecords.reduce((sum, r) => sum + r.speed, 0) / hourRecords.length;
      const avgRpm = hourRecords.reduce((sum, r) => sum + r.rpmPortside, 0) / hourRecords.length;
      
      speedData.push(avgSpeed);
      rpmData.push(avgRpm);
      fuelData.push(vessel.fuelConsumption + (Math.random() - 0.5) * 10); // Fuel still simulated
    } else {
      // Use vessel's current values with some variation if no data
      speedData.push(vessel.speed + (Math.random() - 0.5) * 4);
      rpmData.push(vessel.rpmPortside + (Math.random() - 0.5) * 200);
      fuelData.push(vessel.fuelConsumption + (Math.random() - 0.5) * 10);
    }
  }

  return { hours, speedData, rpmData, fuelData };
};