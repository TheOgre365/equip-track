import { Box, Cable, ChevronDown, ChevronRight, Clock, Edit2, Headphones, Keyboard, Laptop, Monitor, Mouse, RotateCcw, Smartphone, Trash2, UserPlus, Wrench } from 'lucide-react';
import { useState } from 'react';

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to: string | null;
  serial_number: string;
}

interface AllAssetsProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onCheckIn: (asset: Asset) => void;
  onMaintenance: (asset: Asset) => void;
  onHistory: (asset: Asset) => void;
  title?: string;
}

// Helper to get the right icon
const getIcon = (type: string) => {
  switch (type) {
    case 'Laptop': return <Laptop size={20} />;
    case 'Phone': case 'Smartphone': return <Smartphone size={20} />;
    case 'Keyboard': return <Keyboard size={20} />;
    case 'Monitor': return <Monitor size={20} />;
    case 'Mouse': return <Mouse size={20} />;
    case 'Headset': return <Headphones size={20} />;
    case 'Cable': return <Cable size={20} />;
    default: return <Box size={20} />;
  }
};

export function AllAssets({ assets, onEdit, onDelete, onCheckIn, onMaintenance, onHistory, title = "Device" }: AllAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // State to track which groups are open (by default, all can be closed or open)
  // We will store the "Type Name" in this array if it is OPEN.
  const [openGroups, setOpenGroups] = useState<string[]>(['Keyboard', 'Mouse', 'Monitor', 'Laptop', 'PC']); 

  const toggleGroup = (type: string) => {
    if (openGroups.includes(type)) {
      setOpenGroups(openGroups.filter(t => t !== type)); // Close it
    } else {
      setOpenGroups([...openGroups, type]); // Open it
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- GROUPING LOGIC ---
  // 1. Find all unique types in the current filtered list
  const uniqueTypes = Array.from(new Set(filteredAssets.map(a => a.type))).sort();

  // Reusable Row Component
  const AssetRow = ({ asset }: { asset: Asset }) => (
    <tr key={asset.id} className="hover:bg-blue-50/30 transition group border-b border-gray-50 last:border-b-0">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${['Laptop', 'Phone', 'Tablet', 'PC'].includes(asset.type) ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
            {getIcon(asset.type)}
          </div>
          <div>
              <p className="font-bold text-sm text-gray-900">{asset.name}</p>
              <p className="text-xs text-gray-500 font-mono">{asset.serial_number}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-3">
        <span className={`
            px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm text-white
            ${asset.status === 'Available' ? 'bg-green-600' : 
              asset.status === 'In Use' ? 'bg-blue-600' : 
              'bg-red-600'}
        `}>
            {asset.status}
        </span>
      </td>
      
      <td className="px-6 py-3 text-gray-700 text-xs font-medium">
          {asset.assigned_to || <span className="text-gray-400 italic">Not Assigned</span>}
      </td>
      
      <td className="px-6 py-3 text-right">
        <div className="flex justify-end gap-2">
            {asset.status === 'In Use' ? (
                <button onClick={() => onCheckIn(asset)} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-200 transition">
                    <RotateCcw size={14} /> Return
                </button>
            ) : (
                <button onClick={() => onEdit(asset)} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
                    <UserPlus size={14} /> Deploy
                </button>
            )}
            <button onClick={() => onHistory(asset)} className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition" title="View History">
                <Clock size={16} />
            </button>
            <button onClick={() => onMaintenance(asset)} className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition">
                <Wrench size={16} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={() => onEdit(asset)} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(asset.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition">
                <Trash2 size={16} />
            </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Inventory List</h2>
           <p className="text-gray-500 text-xs">Manage your {title.toLowerCase()}s</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" placeholder={`Search ${title.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-sm"
          />
          <select 
             value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
             className="pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm w-full md:w-auto"
           >
             <option value="All">All Status</option>
             <option value="Available">Available</option>
             <option value="In Use">In Use</option>
             <option value="Maintenance">Maintenance</option>
           </select>
        </div>
      </div>

      {/* --- CONDITIONAL RENDERING: GROUPED vs STANDARD --- */}
      {title === "Accessory" ? (
        // ACCESSORY VIEW: Collapsible Groups
        <div className="space-y-4">
          {uniqueTypes.map(type => {
             const itemsInGroup = filteredAssets.filter(a => a.type === type);
             if(itemsInGroup.length === 0) return null;
             const isOpen = openGroups.includes(type);

             return (
               <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Clickable Header */}
                  <div 
                    onClick={() => toggleGroup(type)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition select-none bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                        {/* Icon Box */}
                        <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm">
                          {getIcon(type)}
                        </div>
                        <h3 className="text-base font-bold text-gray-800">{type}s</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {itemsInGroup.length}
                        </span>
                    </div>
                    {/* Arrow Icon */}
                    <div className="text-gray-400">
                        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isOpen && (
                    <div className="border-t border-gray-100">
                      <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50/30 text-xs text-gray-400 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-2 font-medium">Model / Name</th>
                            <th className="px-6 py-2 font-medium">Status</th>
                            <th className="px-6 py-2 font-medium">Assigned</th>
                            <th className="px-6 py-2 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsInGroup.map(asset => <AssetRow key={asset.id} asset={asset} />)}
                        </tbody>
                      </table>
                    </div>
                  )}
               </div>
             )
          })}
          {filteredAssets.length === 0 && (
             <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
               No accessories found.
             </div>
          )}
        </div>
      ) : (
        // STANDARD VIEW (Main Assets): One big table
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto"> 
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => <AssetRow key={asset.id} asset={asset} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}