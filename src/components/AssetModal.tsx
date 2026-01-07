import { Printer, Save, Trash2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
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
  const [name, setName] = useState(asset.name);
  const [type, setType] = useState(asset.type);
  const [status, setStatus] = useState(asset.status);
  const [serial, setSerial] = useState(asset.serial_number);
  const [assignedTo, setAssignedTo] = useState(asset.assigned_to || '');
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'qr'>('details');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      const { data } = await supabase.from('employees').select('full_name');
      if (data) setEmployees(data);
    }
    fetchEmployees();
  }, []);

  const isAccessory = ['Keyboard', 'Mouse', 'Mouse Pad', 'Monitor', 'Headset', 'Cable', 'Accessory', 'Other'].includes(type);

  // Auto-lock assignment
  useEffect(() => {
    if (status === 'Maintenance' || status === 'Available' || isAccessory) {
      setAssignedTo(''); 
    }
  }, [status, isAccessory]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        name,
        type,
        status,
        serial_number: serial,
        assigned_to: (status === 'In Use' && !isAccessory) ? assignedTo : null 
      };

      if (asset.id === 0) {
        await supabase.from('assets').insert(updateData);
      } else {
        await supabase.from('assets').update(updateData).eq('id', asset.id);
      }
      onSaved();
      onClose();
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Permanently delete this item?')) {
      setIsSaving(true);
      await supabase.from('assets').delete().eq('id', asset.id);
      onSaved();
      onClose();
    }
  };

  const isAssignmentDisabled = status === 'Maintenance' || status === 'Available' || isAccessory;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
        <div className="flex border-b border-gray-100">
          <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}>Details</button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'qr' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}>QR Code</button>
          <button onClick={onClose} type="button" className="px-4 text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="p-6">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label><input className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Logitech K380" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* DYNAMIC LABEL: TYPE vs ACCESSORY */}
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    {isAccessory ? 'Accessory' : 'Type'}
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white" value={type} onChange={e => setType(e.target.value)}>
                    <optgroup label="Main Assets">
                      <option>Laptop</option><option>PC</option><option>Phone</option><option>Tablet</option>
                    </optgroup>
                    <optgroup label="Accessories">
                      <option>Keyboard</option><option>Mouse</option><option>Mouse Pad</option><option>Monitor</option><option>Headset</option><option>Cable</option><option>Accessory</option><option>Other</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="Available">Available</option>
                        {!isAccessory && <option value="In Use">In Use</option>}
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
              </div>

              {!isAccessory && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned To {isAssignmentDisabled && <span className="text-red-400 ml-2 text-[10px]">(Locked)</span>}</label>
                  <select className={`w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white ${isAssignmentDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} disabled={isAssignmentDisabled}>
                    <option value="">-- Not Assigned --</option>
                    {employees.map(emp => (<option key={emp.full_name} value={emp.full_name}>{emp.full_name}</option>))}
                  </select>
                </div>
              )}

              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Serial Number / ID</label><input className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono text-gray-600" value={serial} onChange={e => setSerial(e.target.value)} placeholder="Optional" /></div>
              
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-50">
                {asset.id !== 0 && (<button onClick={handleDelete} type="button" className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18} /></button>)}
                <div className="flex gap-3 ml-auto">
                   <button onClick={onClose} type="button" className="px-4 py-2 text-gray-500 text-sm font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                   <button onClick={handleSave} type="button" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2"><Save size={16} /> Save</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
               <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100"><QRCodeSVG value={`Asset: ${asset.name} | SN: ${asset.serial_number}`} size={180} /></div>
               <div className="text-center"><h3 className="font-bold text-gray-800 text-lg">{name}</h3><p className="text-gray-400 font-mono text-sm">{serial}</p></div>
               <button onClick={() => window.print()} type="button" className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition shadow-lg"><Printer size={18} /> Print Label</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}