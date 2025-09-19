import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, BarChart3 } from 'lucide-react';
import { mockVessels, generateHourlyData } from '../../data/mockData';
import { Vessel } from '../../types/vessel';

export default function DailyReport() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(mockVessels[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'speed' | 'rpm' | 'fuel'>('speed');

  const data = generateHourlyData(selectedVessel);

  const getChartData = () => {
    switch (reportType) {
      case 'speed':
        return {
          label: 'Speed (knots)',
          data: data.speedData,
          color: 'rgb(59, 130, 246)',
          bgColor: 'rgba(59, 130, 246, 0.1)'
        };
      case 'rpm':
        return {
          label: 'RPM',
          data: data.rpmData,
          color: 'rgb(249, 115, 22)',
          bgColor: 'rgba(249, 115, 22, 0.1)'
        };
      case 'fuel':
        return {
          label: 'Fuel Consumption (L/h)',
          data: data.fuelData,
          color: 'rgb(220, 38, 38)',
          bgColor: 'rgba(220, 38, 38, 0.1)'
        };
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.data);
  const minValue = Math.min(...chartData.data);

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Download size={16} />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Select Vessel
          </label>
          <select
            value={selectedVessel.id}
            onChange={(e) => {
              const vessel = mockVessels.find(v => v.id === e.target.value);
              if (vessel) setSelectedVessel(vessel);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {mockVessels.map((vessel) => (
              <option key={vessel.id} value={vessel.id}>
                {vessel.name} ({vessel.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'speed' | 'rpm' | 'fuel')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="speed">Speed Analysis</option>
            <option value="rpm">Engine RPM</option>
            <option value="fuel">Fuel Consumption</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-1 sm:space-x-2 text-sm">
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Average</h3>
            <TrendingUp className="text-blue-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {(chartData.data.reduce((a, b) => a + b, 0) / chartData.data.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">{chartData.label.split('(')[1]?.replace(')', '') || 'units'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Maximum</h3>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{maxValue.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{chartData.label.split('(')[1]?.replace(')', '') || 'units'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Minimum</h3>
            <TrendingUp className="text-orange-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{minValue.toFixed(1)}</p>
          <p className="text-xs text-gray-500">{chartData.label.split('(')[1]?.replace(')', '') || 'units'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Variation</h3>
            <TrendingUp className="text-purple-500" size={16} />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {(maxValue - minValue).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">Range</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          {chartData.label} - {selectedVessel.name}
        </h3>
        
        <div className="h-64 sm:h-80 relative overflow-x-auto">
          <svg className="w-full h-full min-w-96" viewBox="0 0 800 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="60"
                y1={60 + i * 48}
                x2="760"
                y2={60 + i * 48}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map((i) => (
              <text
                key={i}
                x="50"
                y={68 + i * 48}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {(maxValue - (i * (maxValue - minValue) / 4)).toFixed(0)}
              </text>
            ))}
            
            {/* Chart line */}
            <polyline
              points={chartData.data
                .map((value, index) => {
                  const x = 60 + (index * 700) / (chartData.data.length - 1);
                  const y = 60 + (192 * (maxValue - value)) / (maxValue - minValue);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={chartData.color}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {chartData.data.map((value, index) => {
              const x = 60 + (index * 700) / (chartData.data.length - 1);
              const y = 60 + (192 * (maxValue - value)) / (maxValue - minValue);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={chartData.color}
                  className="hover:r-5 transition-all cursor-pointer"
                >
                  <title>{`${data.hours[index]}: ${value.toFixed(1)}`}</title>
                </circle>
              );
            })}
            
            {/* X-axis labels */}
            {data.hours.filter((_, i) => i % 4 === 0).map((hour, i) => (
              <text
                key={i}
                x={60 + (i * 4 * 700) / (data.hours.length - 1)}
                y="280"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {hour}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}