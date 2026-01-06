import { Box, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  
  const getLinkClass = (viewName: string) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer";
    return currentView === viewName 
      ? `${baseClass} bg-blue-50 text-blue-700` // Active Style
      : `${baseClass} text-gray-600 hover:bg-gray-100 hover:text-gray-900`; // Inactive Style
  };

  return (
    <nav className="flex flex-col h-full justify-between p-4">
      <div className="space-y-2">
        
        {/* Dashboard Link */}
        <div onClick={() => onNavigate('dashboard')} className={getLinkClass('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        {/* All Assets Link */}
        <div onClick={() => onNavigate('all-assets')} className={getLinkClass('all-assets')}>
          <Box size={20} />
          <span>All Assets</span>
        </div>

        {/* Employees Link */}
        <div onClick={() => onNavigate('employees')} className={getLinkClass('employees')}>
          <Users size={20} />
          <span>Employees</span>
        </div>

        {/* Settings Link */}
        <div onClick={() => onNavigate('settings')} className={getLinkClass('settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </div>

      </div>

      <div className="border-t border-gray-100 pt-4 mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}