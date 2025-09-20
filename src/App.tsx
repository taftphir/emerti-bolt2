import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import LatestData from './components/Monitoring/LatestData';
import VesselMap from './components/Monitoring/VesselMap';
import VesselTracking from './components/Monitoring/VesselTracking';
import DataHistory from './components/Monitoring/DataHistory';
import DailyReport from './components/Monitoring/DailyReport';
import UserManagement from './components/Configuration/UserManagement';
import VesselManagement from './components/Configuration/VesselManagement';
import VesselTypeManagement from './components/Configuration/VesselTypeManagement';
import SystemSettings from './components/Configuration/SystemSettings';

function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    // Check user permissions for each section
    if (!user) return <DashboardOverview />;
    
    // Viewer role restrictions
    if (user.role === 'viewer') {
      switch (activeSection) {
        case 'dashboard':
          return <DashboardOverview />;
        case 'daily-report':
          return <DailyReport />;
        default:
          // Redirect viewer to dashboard if trying to access restricted sections
          setActiveSection('dashboard');
          return <DashboardOverview />;
      }
    }
    
    // Operator role restrictions
    if (user.role === 'operator') {
      switch (activeSection) {
        case 'dashboard':
          return <DashboardOverview />;
        case 'latest-data':
          return <LatestData />;
        case 'map':
          return <VesselMap />;
        case 'tracking':
          return <VesselTracking />;
        case 'data-history':
          return <DataHistory />;
        case 'daily-report':
          return <DailyReport />;
        default:
          // Redirect operator to dashboard if trying to access configuration
          if (['users', 'vessels', 'vessel-types', 'settings'].includes(activeSection)) {
            setActiveSection('dashboard');
            return <DashboardOverview />;
          }
          return <DashboardOverview />;
      }
    }
    
    // Admin role - full access
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'latest-data':
        return <LatestData />;
      case 'map':
        return <VesselMap />;
      case 'tracking':
        return <VesselTracking />;
      case 'data-history':
        return <DataHistory />;
      case 'daily-report':
        return <DailyReport />;
      case 'users':
        return <UserManagement />;
      case 'vessels':
        return <VesselManagement />;
      case 'vessel-types':
        return <VesselTypeManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeSection={activeSection} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-2 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SystemConfigProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SystemConfigProvider>
  );
}

export default App;