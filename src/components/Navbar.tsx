import { Keyboard, Laptop, LayoutDashboard, Settings, Users } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'all-assets', label: 'All Assets', icon: <Laptop size={20} /> },
    { id: 'accessories', label: 'Accessories', icon: <Keyboard size={20} /> }, // <--- NEW TAB
    { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="space-y-1 py-4">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg
            ${currentView === item.id 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}