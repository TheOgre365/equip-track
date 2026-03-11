import {
  Box, Cable,
  Camera,
  ChevronDown, Clock, Edit2, Headphones,
  Keyboard, Laptop, Monitor, Mouse,
  PcCase,
  Printer,
  Projector,
  RotateCcw,
  Scan,
  Server,
  Smartphone,
  Tablet,
  Trash2,
  UserPlus, Wrench
} from 'lucide-react';
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

const getIcon = (type: string) => {
  switch (type) {
    case 'Laptop': return <Laptop size={20} />;
    case 'Phone': case 'Smartphone': return <Smartphone size={20} />;
    case 'Tablet': return <Tablet size={20} />;
    case 'PC': return <PcCase size={20} />;
    case 'Keyboard': return <Keyboard size={20} />;
    case 'Monitor': return <Monitor size={20} />;
    case 'Mouse': return <Mouse size={20} />;
    case 'Headset': return <Headphones size={20} />;
    case 'Cable': return <Cable size={20} />;
    case 'Printer': return <Printer size={20} />;
    case 'Server': return <Server size={20} />;
    case 'Camera': return <Camera size={20} />;
    case 'Scanner': return <Scan size={20} />;
    case 'Projector': return <Projector size={20} />;
    default: return <Box size={20} />;
  }
};

export function AllAssets({ assets, onEdit, onDelete, onCheckIn, onMaintenance, onHistory, title = "Device" }: AllAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Default open groups
  const [openGroups, setOpenGroups] = useState<string[]>(['Keyboard', 'Mouse', 'Monitor', 'Laptop', 'PC', 'Phone', 'Tablet']); 

  const toggleGroup = (type: string) => {
    if (openGroups.includes(type)) {
      setOpenGroups(openGroups.filter(t => t !== type)); 
    } else {
      setOpenGroups([...openGroups, type]); 
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(filteredAssets.map(a => a.type))).sort();

  const AssetRow = ({ asset }: { asset: Asset }) => (
    <tr key={asset.id} className="hover:bg-blue-50/20 transition-colors group border-b border-gray-50 last:border-b-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all`}>
            {getIcon(asset.type)}
          </div>
          <div>
              <p className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{asset.name}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{asset.serial_number}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border
            ${asset.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 
              asset.status === 'In Use' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
              'bg-orange-50 text-orange-700 border-orange-200'}
        `}>
            <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Available' ? 'bg-green-500' : asset.status === 'In Use' ? 'bg-indigo-500' : 'bg-orange-500'}`}></div>
            {asset.status}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-600 text-sm font-semibold">
          {asset.assigned_to || <span className="text-gray-400 font-medium italic text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Not Assigned</span>}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {asset.status === 'In Use' ? (
                <button onClick={() => onCheckIn(asset)} className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors border border-orange-200/50">
                    <RotateCcw size={14} className="stroke-[2.5]" /> Return
                </button>
            ) : (
                <button onClick={() => onEdit(asset)} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors border border-blue-200/50">
                    <UserPlus size={14} className="stroke-[2.5]" /> Deploy
                </button>
            )}
            <div className="w-px h-6 bg-gray-200 mx-2 self-center"></div>
            <button onClick={() => onHistory(asset)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="History"><Clock size={16} className="stroke-[2.5]" /></button>
            <button onClick={() => onMaintenance(asset)} className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors border border-transparent hover:border-orange-100" title="Maintenance"><Wrench size={16} className="stroke-[2.5]" /></button>
            <button onClick={() => onEdit(asset)} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-transparent hover:border-blue-100"><Edit2 size={16} className="stroke-[2.5]" /></button>
            <button onClick={() => onDelete(asset.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 size={16} className="stroke-[2.5]" /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100/50 shadow-sm">
        <div><h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventory List</h2><p className="text-gray-500 text-sm font-medium mt-1">Manage your {title.toLowerCase()}s</p></div>
        <div className="flex flex-col md:flex-row gap-3">
          <input type="text" placeholder={`Search ${title.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 w-full md:w-64 text-sm font-medium transition-all" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-4 pr-8 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm font-medium w-full md:w-auto transition-all cursor-pointer hover:bg-white">
             <option value="All">All Status</option><option value="Available">Available</option><option value="In Use">In Use</option><option value="Maintenance">Maintenance</option>
           </select>
        </div>
      </div>

      <div className="space-y-4">
        {uniqueTypes.map(type => {
           const itemsInGroup = filteredAssets.filter(a => a.type === type);
           if (searchTerm && itemsInGroup.length === 0) return null;
           
           const isOpen = openGroups.includes(type);

           return (
             <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition-shadow">
                <div onClick={() => toggleGroup(type)} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors select-none">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 shadow-inner border border-gray-100">{getIcon(type)}</div>
                      <h3 className="text-lg font-bold text-gray-800">{type}s</h3>
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-black px-2.5 py-1 rounded-lg ml-2">{itemsInGroup.length}</span>
                  </div>
                  <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><ChevronDown size={20} className="stroke-[2.5]" /></div>
                </div>
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {itemsInGroup.length > 0 ? (
                      <table className="w-full text-left min-w-[900px]">
                          <thead className="bg-gray-50/30 text-xs text-gray-400 uppercase tracking-wider">
                          <tr><th className="px-6 py-2 font-medium">Model / Name</th><th className="px-6 py-2 font-medium">Status</th><th className="px-6 py-2 font-medium">Assigned</th><th className="px-6 py-2 font-medium text-right">Actions</th></tr>
                          </thead>
                          <tbody>{itemsInGroup.map(asset => <AssetRow key={asset.id} asset={asset} />)}</tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-xs text-gray-400 italic">No {type.toLowerCase()}s in inventory yet.</div>
                    )}
                  </div>
                )}
             </div>
           )
        })}
      </div>
    </div>
  );
}