import { motion } from 'framer-motion';
import { Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import { supabase } from '../supabaseClient';

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to: string | null;
  serial_number: string;
}

interface AssetModalProps {
  asset: Asset;
  onClose: () => void;
  onSaved: () => void;
}

export function AssetModal({ asset, onClose, onSaved }: AssetModalProps) {
  const [formData, setFormData] = useState<Asset>(asset);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'qr'>('details');
  
  // NEW: State to store the list of employees
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    setFormData(asset);
    fetchEmployees(); // Fetch list when modal opens
  }, [asset]);

  // NEW: Function to get employees from Supabase
  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('full_name');
    if (data) setEmployees(data);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { id, ...dataToSend } = formData;

      if (asset.id === 0) {
        const { error } = await supabase.from('assets').insert([dataToSend]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assets')
          .update(dataToSend)
          .eq('id', asset.id);
        if (error) throw error;
      }
      onSaved(); 
      onClose();
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(`Error Saving: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const { error } = await supabase.from('assets').delete().eq('id', asset.id);
      if (error) throw error;
      onSaved();
      onClose();
    } catch (error: any) {
      alert(`Error Deleting: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex bg-gray-200 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   Details
                </button>
                {asset.id !== 0 && (
                  <button 
                    onClick={() => setActiveTab('qr')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'qr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                     QR Code
                  </button>
                )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input name="name" required value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Phone</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* NEW: Assigned To Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select 
                  name="assigned_to" 
                  value={formData.assigned_to || ''} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                >
                  <option value="">-- Unassigned --</option>
                  {employees.map((emp, i) => (
                    <option key={i} value={emp.full_name}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input name="serial_number" value={formData.serial_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  {asset.id !== 0 ? (
                    <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 p-2">
                       <Trash2 size={20} />
                    </button>
                  ) : <div></div>}

                  <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                      <Save size={18} /> {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
              </div>
            </form>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
               <div className="bg-white p-4 border rounded-xl shadow-sm">
                  <QRCode 
                    value={JSON.stringify({ id: asset.id, sn: asset.serial_number, name: asset.name, assigned: asset.assigned_to })} 
                    size={200} 
                  />
               </div>
               <div className="text-center">
                 <p className="font-bold text-gray-900 text-lg">{asset.name}</p>
                 <p className="text-gray-500 font-mono text-sm">{asset.serial_number}</p>
                 {/* Show who it is assigned to on the QR screen too */}
                 {asset.assigned_to && (
                   <p className="text-blue-600 text-sm mt-2 font-medium">Assigned to: {asset.assigned_to}</p>
                 )}
               </div>
               <button onClick={() => window.print()} className="w-full bg-gray-900 text-white py-2 rounded-lg mt-4">
                  Print Label
               </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}