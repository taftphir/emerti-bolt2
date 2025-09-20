import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Zap, Clock } from 'lucide-react';
import { mockVessels, fetchVesselsFromDatabase } from '../../data/mockData';
import { Vessel } from '../../types/vessel';
import VesselTracking from './VesselTracking';

export default function VesselMap() {
  const [vessels, setVessels] = useState<Vessel[]>(mockVessels);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingVesselId, setTrackingVesselId] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const dbVessels = await fetchVesselsFromDatabase();
        setVessels(dbVessels);
      } catch (error) {
        console.error('Failed to load vessels from database:', error);
        setVessels(mockVessels);
      } finally {
        setLoading(false);
      }
    };

    loadVessels();
  }, []);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Map bounds for Madura Island area
  const mapBounds = {
    north: -6.0,
    south: -8.5,
    east: 115.0,
    west: 111.5
  };

  // Convert lat/lng to pixel position within the map container
  const latLngToPixel = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleShowTracking = (vesselId: string) => {
    setTrackingVesselId(vesselId);
    setShowTracking(true);
  };

  const handleBackToMap = () => {
    setShowTracking(false);
    setTrackingVesselId('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Warning': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 border-green-300';
      case 'Warning': return 'bg-yellow-100 border-yellow-300';
      case 'Critical': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (showTracking) {
    return <VesselTracking selectedVesselId={trackingVesselId} onBack={handleBackToMap} />;
  }

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

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[70vh] lg:h-[80vh] relative">
              {/* OpenStreetMap iframe */}
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=111.5%2C-8.5%2C115.0%2C-6.0&layer=mapnik&marker=-7.2364197%2C113.3032598"
                className="w-full h-full border-0"
                title="Madura Island Map"
                onLoad={() => setMapLoaded(true)}
              />
              
              {/* Loading overlay */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
              
              {/* Vessel markers overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {vessels.map((vessel) => {
                  const position = latLngToPixel(vessel.position.lat, vessel.position.lng);
                  
                  return (
                    <div
                      key={vessel.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto ${
                        selectedVessel?.id === vessel.id ? 'z-20' : 'z-10'
                      }`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() => setSelectedVessel(vessel)}
                    >
                      <div className={`relative p-1 rounded-full ${getStatusBg(vessel.status)} border-2 transition-transform hover:scale-110 ${
                        selectedVessel?.id === vessel.id ? 'scale-125' : ''
                      } shadow-lg bg-white`}>
                        <img 
                          src="/ship.png"
                          alt="Vessel"
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                          style={{ transform: `rotate(${vessel.heading}deg)` }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white shadow-sm"
                             style={{ backgroundColor: vessel.status === 'Active' ? '#10b981' : vessel.status === 'Warning' ? '#f59e0b' : '#ef4444' }}>
                        </div>
                        
                        {/* Vessel name label */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm">
                          <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{vessel.name}</span>
                        </div>
                        
                        {selectedVessel?.id === vessel.id && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8 bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-3 min-w-32 sm:min-w-48 z-50">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-800">{vessel.name}</h4>
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                              <div className="flex justify-between">
                                <span>Speed:</span>
                                <span>{vessel.speed.toFixed(1)} kts</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Heading:</span>
                                <span>{vessel.heading}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Position:</span>
                                <span>{vessel.position.lat.toFixed(3)}, {vessel.position.lng.toFixed(3)}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowTracking(vessel.id);
                                }}
                                className="w-full flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                              >
                                <Navigation size={12} />
                                <span>Show Tracking</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVessel(null);
                                }}
                                className="w-full flex items-center justify-center space-x-1 px-2 py-1 mt-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                              >
                                <span>Close</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Map controls and legend */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white rounded-lg shadow-sm p-2 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Fleet Monitoring Area</h3>
                <p className="text-xs text-gray-600">Center: -7.236, 113.303</p>
                <p className="text-xs text-gray-500 mt-1">Click vessel for details</p>
              </div>
              
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white rounded-lg shadow-sm p-2 sm:p-3">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Active</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <span className="hidden sm:inline">Warning</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <span className="hidden sm:inline">Critical</span>
                  </div>
                </div>
              </div>

              {/* OpenStreetMap attribution */}
              <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 rounded px-2 py-1">
                <a 
                  href="https://www.openstreetmap.org/copyright" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  © OpenStreetMap
                </a>
              </div>
            </div>
      </div>
    </div>
  );
}