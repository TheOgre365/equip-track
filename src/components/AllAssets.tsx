import { Filter, Laptop, MoreVertical, Search, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to: string | null;
  serial_number: string;
}

// 1. Update the Interface to accept the "onEdit" function
interface AllAssetsProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void; 
}

// 2. Add "onEdit" to the props here
export function AllAssets({ assets, onEdit }: AllAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">All Assets</h2>
           <p className="text-gray-500 text-sm">View and manage your entire inventory</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
             >
               <option value="All">All Status</option>
               <option value="Available">Available</option>
               <option value="In Use">In Use</option>
               <option value="Maintenance">Maintenance</option>
             </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Asset Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Serial No.</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${asset.type === 'Laptop' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                        {asset.type === 'Laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                      </div>
                      <span className="font-medium text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                       asset.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 
                       asset.status === 'In Use' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                       'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {asset.assigned_to || <span className="text-gray-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-mono">
                    {asset.serial_number}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* 3. Connect the Button to the onEdit function */}
                    <button 
                      onClick={() => onEdit(asset)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                   No assets found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}