import { Laptop, LayoutDashboard, Settings, Users } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'all-assets', label: 'All Assets', icon: <Laptop size={20} /> },
    { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="space-y-1.5 py-4 relative z-10">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all duration-300 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${isActive 
                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/5 text-blue-700 shadow-sm border border-blue-200/50 relative overflow-hidden' 
                : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent hover:border-gray-200/50'
              }`}
          >
            {/* Active Indicator Line */}
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-md"></div>}
            
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
               {item.icon}
            </div>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}