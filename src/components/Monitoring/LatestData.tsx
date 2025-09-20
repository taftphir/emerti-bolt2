import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import AnalogGauge from './AnalogGauge';
import PowerSourceIndicator from './PowerSourceIndicator';
import { mockVessels, fetchVesselsFromDatabase } from '../../data/mockData';
import { Vessel } from '../../types/vessel';

export default function LatestData() {
  const [vessels, setVessels] = useState<Vessel[]>(mockVessels);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const dbVessels = await fetchVesselsFromDatabase();
        setVessels(dbVessels);
        setSelectedVessel(dbVessels[0] || null);
      } catch (error) {
        console.error('Failed to load vessels from database:', error);
        setVessels(mockVessels);
        setSelectedVessel(mockVessels[0]);
      } finally {
        setLoading(false);
      }
    };

    loadVessels();
  }, []);

  useEffect(() => {
    if (!selectedVessel) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate slight data variations
      setSelectedVessel(prev => ({
        ...prev!,
        speed: prev.speed + (Math.random() - 0.5) * 2,
        rpmPortside: prev.rpmPortside + (Math.random() - 0.5) * 50,
        rpmStarboard: prev.rpmStarboard + (Math.random() - 0.5) * 50,
        rpmCenter: prev.rpmCenter + (Math.random() - 0.5) * 50,
        fuelConsumption: prev.fuelConsumption + (Math.random() - 0.5) * 5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedVessel]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading vessel data...</p>
        </div>
      </div>
    );
  }

  if (!selectedVessel) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No vessels available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            <span className="hidden sm:inline">Last update: </span>
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Select Vessel
        </label>
        <select
          value={selectedVessel.id}
          onChange={(e) => {
            const vessel = vessels.find(v => v.id === e.target.value);
            if (vessel) setSelectedVessel(vessel);
          }}
          className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {vessels.map((vessel) => (
            <option key={vessel.id} value={vessel.id}>
              {vessel.name} ({vessel.type})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{selectedVessel.name}</h3>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            selectedVessel.status === 'Active' ? 'bg-green-100 text-green-800' :
            selectedVessel.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {selectedVessel.status}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-600">Vessel ID</p>
            <p className="font-medium">{selectedVessel.id}</p>
          </div>
          <div>
            <p className="text-gray-600">Type</p>
            <p className="font-medium">{selectedVessel.type}</p>
          </div>
          <div>
            <p className="text-gray-600">Position</p>
            <p className="font-medium">{selectedVessel.position.lat.toFixed(4)}, {selectedVessel.position.lng.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Update</p>
            <p className="font-medium">{selectedVessel.lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Power Source & System Status - Compact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Power Source & System Status</h3>
          <PowerSourceIndicator
            acPower={true}
            dcPower={true}
            backupBattery={true}
            alarm={selectedVessel.status === 'Warning' || selectedVessel.status === 'Critical'}
            blackout={selectedVessel.status === 'Critical'}
          />
        </div>

        {/* Navigation, Speed & Fuel */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation, Speed & Fuel</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.speed}
                  min={0}
                  max={25}
                  unit="kts"
                  label="Speed"
                  color="blue"
                  warningThreshold={3}
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.heading}
                  min={0}
                  max={360}
                  unit="°"
                  label="Heading"
                  color="green"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.fuelConsumption}
                  min={0}
                  max={100}
                  unit="L/h"
                  label="Fuel Consumption"
                  color="red"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Engine Performance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Engine Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.rpmPortside}
                  min={0}
                  max={2500}
                  unit="RPM"
                  label="Engine Portside"
                  color="orange"
                  warningThreshold={500}
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.rpmStarboard}
                  min={0}
                  max={2500}
                  unit="RPM"
                  label="Engine Starboard"
                  color="orange"
                  warningThreshold={500}
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <AnalogGauge
                  value={selectedVessel.rpmCenter}
                  min={0}
                  max={2500}
                  unit="RPM"
                  label="Engine Center"
                  color="orange"
                  warningThreshold={500}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}