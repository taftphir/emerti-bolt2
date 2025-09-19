import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import LatestData from './components/Monitoring/LatestData';
import VesselMap from './components/Monitoring/VesselMap';
import DataHistory from './components/Monitoring/DataHistory';
import DailyReport from './components/Monitoring/DailyReport';
import UserManagement from './components/Configuration/UserManagement';
import VesselManagement from './components/Configuration/VesselManagement';
import VesselTypeManagement from './components/Configuration/VesselTypeManagement';
import SystemSettings from './components/Configuration/SystemSettings';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'latest-data':
        return <LatestData />;
      case 'map':
        return <VesselMap />;
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