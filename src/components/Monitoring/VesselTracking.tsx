import React, { useState, useEffect } from 'react';
import { MapPin, Navigation as NavigationIcon, Clock, Route, Calendar, Download, ArrowLeft } from 'lucide-react';
import { mockVessels, getHistoryData } from '../../data/mockData';
import { Vessel, HistoryRecord } from '../../types/vessel';

interface VesselTrackingProps {
  selectedVesselId?: string;
  onBack?: () => void;
}

export default function VesselTracking({ selectedVesselId, onBack }: VesselTrackingProps) {
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(
    selectedVesselId ? mockVessels.find(v => v.id === selectedVesselId) || mockVessels[0] : mockVessels[0]
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingData, setTrackingData] = useState<HistoryRecord[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Map bounds for tracking area
  const mapBounds = {
    north: -6.0,
    south: -8.5,
    east: 115.0,
    west: 111.5
  };

  useEffect(() => {
    // Get tracking data for selected vessel and date
    const allHistory = getHistoryData();
    const selectedDateObj = new Date(selectedDate);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const vesselTrackingData = allHistory
      .filter(record => 
        record.vesselId === selectedVessel.id &&
        record.timestamp >= selectedDateObj &&
        record.timestamp < nextDay
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setTrackingData(vesselTrackingData);
  }, [selectedVessel.id, selectedDate]);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Convert lat/lng to pixel position within the map container
  const latLngToPixel = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Generate SVG path for the journey
  const generateJourneyPath = () => {
    if (trackingData.length < 2) return '';
    
    const pathPoints = trackingData.map(record => {
      const pixel = latLngToPixel(record.latitude, record.longitude);
      return `${pixel.x},${pixel.y}`;
    });
    
    return `M ${pathPoints.join(' L ')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Warning': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportTrackingData = () => {
    const csvContent = [
      ['Timestamp', 'Latitude', 'Longitude', 'Speed (kts)', 'Heading (°)', 'RPM Portside', 'RPM Starboard', 'RPM Center'],
      ...trackingData.map(record => [
        record.timestamp.toISOString(),
        record.latitude.toFixed(6),
        record.longitude.toFixed(6),
        record.speed.toFixed(1),
        record.heading.toString(),
        record.rpmPortside.toFixed(2),
        record.rpmStarboard.toFixed(2),
        record.rpmCenter.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedVessel.name}-tracking-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Map</span>
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-800">Vessel Tracking</h2>
            <p className="text-sm text-gray-600">Journey path and movement history</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            <Route size={16} />
            <span className="hidden sm:inline">{showDetails ? 'Hide Details' : 'Show Details'}</span>
          </button>
          <button
            onClick={exportTrackingData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vessel
          </label>
          <select
            value={selectedVessel.id}
            onChange={(e) => {
              const vessel = mockVessels.find(v => v.id === e.target.value);
              if (vessel) setSelectedVessel(vessel);
            }}
            className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {mockVessels.map((vessel) => (
              <option key={vessel.id} value={vessel.id}>
                {vessel.name} ({vessel.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-6 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Route size={16} />
            <span>{trackingData.length} tracking points</span>
          </div>
        </div>
      </div>

      {/* Vessel Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedVessel.image && (
              <img 
                src={selectedVessel.image} 
                alt={selectedVessel.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedVessel.name}</h3>
              <p className="text-sm text-gray-600">{selectedVessel.type} • {selectedVessel.owner}</p>
              <p className="text-xs text-gray-500">Tracking Date: {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedVessel.status === 'Active' ? 'bg-green-100 text-green-800' :
            selectedVessel.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {selectedVessel.status}
          </div>
        </div>
      </div>

      {/* Map and Details */}
      <div className={`grid ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {/* Map */}
        <div className={showDetails ? 'lg:col-span-2' : ''}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-[70vh] lg:h-[80vh] relative">
              {/* OpenStreetMap iframe */}
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=111.5%2C-8.5%2C115.0%2C-6.0&layer=mapnik&marker=-7.2364197%2C113.3032598"
                className="w-full h-full border-0"
                title="Vessel Tracking Map"
                onLoad={() => setMapLoaded(true)}
              />
              
              {/* Loading overlay */}
              {!mapLoaded && (
                <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading tracking map...</p>
                  </div>
                </div>
              )}
              
              {/* Journey path and markers overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Journey path */}
                  {trackingData.length > 1 && (
                    <path
                      d={generateJourneyPath()}
                      stroke="#3b82f6"
                      strokeWidth="0.2"
                      fill="none"
                      strokeDasharray="0.5,0.3"
                      opacity="0.8"
                    />
                  )}
                </svg>
                
                {/* Tracking points */}
                {trackingData.map((record, index) => {
                  const position = latLngToPixel(record.latitude, record.longitude);
                  const isStart = index === 0;
                  const isEnd = index === trackingData.length - 1;
                  const isWaypoint = !isStart && !isEnd;
                  
                  return (
                    <div
                      key={record.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                    >
                      {/* Marker */}
                      <div className={`relative p-1 rounded-full border-2 shadow-lg transition-transform hover:scale-110 ${
                        isStart ? 'bg-green-500 border-green-600' :
                        isEnd ? 'bg-red-500 border-red-600' :
                        'bg-blue-500 border-blue-600'
                      }`}>
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          isStart ? 'bg-white' :
                          isEnd ? 'bg-white' :
                          'bg-white'
                        }`}></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div>{record.timestamp.toLocaleTimeString()}</div>
                          <div>{record.speed.toFixed(1)} kts</div>
                          <div>{record.heading}°</div>
                        </div>
                      </div>
                      
                      {/* Time label for start/end points */}
                      {(isStart || isEnd) && (
                        <div className={`absolute ${isStart ? '-bottom-8' : '-top-8'} left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded px-2 py-1 shadow-sm`}>
                          <span className="text-xs font-medium text-gray-800">
                            {isStart ? 'START' : 'END'}
                          </span>
                          <div className="text-xs text-gray-600">
                            {record.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Journey Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span>Start Point</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span>Waypoint</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-red-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span>End Point</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-500"></div>
                    <span>Journey Path</span>
                  </div>
                </div>
              </div>

              {/* Journey Stats */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Journey Stats</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        Math.round((trackingData[trackingData.length - 1]?.timestamp.getTime() - trackingData[0]?.timestamp.getTime()) / (1000 * 60 * 60)) + 'h' 
                        : '0h'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Speed:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        (trackingData.reduce((sum, r) => sum + r.speed, 0) / trackingData.length).toFixed(1) + ' kts'
                        : '0 kts'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Speed:</span>
                    <span className="font-medium">
                      {trackingData.length > 0 ? 
                        Math.max(...trackingData.map(r => r.speed)).toFixed(1) + ' kts'
                        : '0 kts'}
                    </span>
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

        {/* Details Panel */}
        {showDetails && (
          <div className="space-y-6">
            {/* Journey Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Journey Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">
                    {trackingData[0]?.timestamp.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">
                    {trackingData[trackingData.length - 1]?.timestamp.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-medium">{trackingData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Speed:</span>
                  <span className="font-medium">
                    {trackingData.length > 0 ? 
                      (trackingData.reduce((sum, r) => sum + r.speed, 0) / trackingData.length).toFixed(1) + ' kts'
                      : '0 kts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Tracking Points */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Points</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trackingData.slice(-10).reverse().map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-medium">{record.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                        <MapPin size={12} />
                        <span>{record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{record.speed.toFixed(1)} kts</div>
                      <div className="text-xs text-gray-600">{record.heading}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}