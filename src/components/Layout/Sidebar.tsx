import React from 'react';
import { 
  BarChart3, 
  Map, 
  Activity, 
  FileBarChart,
  TrendingUp,
  Settings, 
  Users,
  Ship,
  Layers,
  Menu,
  X,
  Menu as MenuIcon,
  Navigation as NavigationIcon,
  ChevronDown
} from 'lucide-react';
import { useSystemConfig } from '../../contexts/SystemConfigContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'daily-report', label: 'Daily Report', icon: TrendingUp },
  { id: 'fuel-monitoring', label: 'Fuel Monitoring', icon: Activity, parent: 'monitoring' },
  { id: 'latest-data', label: 'Latest Data', icon: Activity, parent: 'monitoring' },
  { id: 'map', label: 'Map Lokasi', icon: Map, parent: 'monitoring' },
  { id: 'tracking', label: 'Vessel Tracking', icon: NavigationIcon, parent: 'monitoring' },
  { id: 'data-history', label: 'Data History', icon: BarChart3, parent: 'monitoring' },
  { id: 'users', label: 'User Management', icon: Users, parent: 'configuration' },
  { id: 'vessels', label: 'Vessel Management', icon: Ship, parent: 'configuration' },
  { id: 'vessel-types', label: 'Vessel Types', icon: Layers, parent: 'configuration' },
  { id: 'settings', label: 'Settings', icon: Settings, parent: 'configuration' },
];

const sections = {
  monitoring: 'Monitoring',
  configuration: 'Configuration'
};

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
    monitoring: true,
    configuration: false
  });
  const { config } = useSystemConfig();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
    
    // Auto-expand section if selecting a submenu item
    const menuItem = menuItems.find(item => item.id === section);
    if (menuItem && menuItem.parent) {
      setExpandedSections(prev => ({
        ...prev,
        [menuItem.parent]: true
      }));
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        text-white min-h-screen p-4 transition-transform duration-300 ease-in-out z-40
        lg:relative lg:translate-x-0 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        fixed w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ backgroundColor: config.themeColor }}
      >
        <div className={`flex items-center justify-between mb-6 ${isCollapsed ? 'flex-col' : ''}`}>
          <div className={`${isCollapsed ? 'hidden' : 'flex'} items-center space-x-3`}>
            <img 
              src="/fms.png" 
              alt="Application Logo" 
              className="w-36 h-20 object-contain"
            />
          </div>
          
          <button
            onClick={toggleCollapse}
            className="hidden lg:block text-white p-2 rounded transition-colors hover:bg-white hover:bg-opacity-20"
          >
            <MenuIcon size={20} />
          </button>
        </div>
        
        <nav className={isCollapsed ? 'mt-4' : ''}>
        {menuItems.map((item) => {
          if (!item.parent) {
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center lg:px-2' : 'space-x-3 px-4'} py-3 rounded-lg mb-2 text-left transition-colors ${
                  activeSection === item.id 
                    ? 'bg-orange-600 text-white' 
                    : 'text-blue-200'
                }`}
                style={activeSection !== item.id ? {
                  ':hover': { backgroundColor: `${config.themeColor}dd` }
                } : {}}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} />
                {!isCollapsed && (
                  <span>{item.label}</span>
                )}
              </button>
            );
          }
          return null;
        })}

        {Object.entries(sections).map(([sectionId, sectionLabel]) => (
          <div key={sectionId} className="mt-6">
            {!isCollapsed ? (
              <button
                onClick={() => toggleSection(sectionId)}
                className="w-full flex items-center justify-between text-blue-300 text-xs sm:text-sm font-semibold mb-2 px-4 hover:text-blue-200 transition-colors"
              >
                <span>{sectionLabel}</span>
                <ChevronDown 
                  size={14} 
                  className={`transform transition-transform ${expandedSections[sectionId] ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
            ) : (
              <div className="border-t border-blue-700 mx-2 mb-2 hidden lg:block"></div>
            )}
            {(isCollapsed || expandedSections[sectionId]) && menuItems
              .filter(item => item.parent === sectionId)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center lg:px-2' : 'space-x-3 px-6'} py-2 rounded-lg mb-1 text-left transition-colors ${
                    activeSection === item.id 
                      ? 'bg-orange-600 text-white' 
                      : 'text-blue-200'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={18} />
                  {!isCollapsed && (
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  )}
                </button>
              ))}
          </div>
        ))}
        
        {/* Powered by alugara.id */}
        <div className="mt-8 pt-4 border-t" style={{ borderColor: `${config.themeColor}aa` }}>
          {!isCollapsed ? (
            <div className="text-center">
              <p className="text-blue-300 text-xs">Powered by</p>
              <a 
                href="https://alugara.id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors"
              >
                Alugara Inovasi Utama
              </a>
            </div>
          ) : (
            <div className="hidden lg:block text-center">
              <a 
                href="https://alugara.id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 text-xs font-bold hover:text-orange-300 transition-colors"
                title="Powered by Alugara Inovasi Utama"
              >
                A
              </a>
            </div>
          )}
        </div>
      </nav>
      </div>
    </>
  );
}