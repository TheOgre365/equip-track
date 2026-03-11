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

// --- SEED CATALOG ---
const SEED_CATALOG: Record<string, string[]> = {
  'Laptop': ['Lenovo ThinkPad X1 Carbon', 'Dell XPS 15', 'MacBook Pro M3', 'HP EliteBook 840', 'Asus ExpertBook'],
  'Phone': ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Google Pixel 8', 'OnePlus 12', 'Samsung Galaxy A55'],
  'Tablet': ['iPad Pro 12.9"', 'Samsung Galaxy Tab S9', 'Microsoft Surface Pro 9', 'iPad Air 5', 'Lenovo Tab P11'],
  'PC': ['Dell OptiPlex 7000', 'Mac Mini M2', 'HP Elite Mini 800', 'Lenovo ThinkCentre', 'Custom Workstation'],
  'Monitor': ['Dell UltraSharp 24"', 'Samsung Odyssey G5', 'LG UltraGear 27"', 'BenQ 27" 4K', 'HP Eye Ease 24"'],
  'Keyboard': ['Logitech MX Keys', 'Keychron K2', 'Dell Wired Keyboard', 'Redragon K552', 'Apple Magic Keyboard'],
  'Mouse': ['Logitech MX Master 3S', 'Razer DeathAdder', 'Dell Optical Mouse', 'Apple Magic Mouse', 'Logitech G502'],
  'Headset': ['Jabra Evolve2 65', 'Sony WH-1000XM5', 'Poly Voyager Focus', 'Logitech Zone Vibe', 'Sennheiser SC 160'],
  'Printer': ['HP LaserJet Pro', 'Canon ImageClass', 'Epson EcoTank', 'Brother MFC', 'Xerox Phaser'],
  'Projector': ['Epson VS260', 'BenQ TH685', 'Sony VPL', 'Optoma UHD38', 'ViewSonic PA503'],
  'Server': ['Dell PowerEdge R750', 'HPE ProLiant DL380', 'Lenovo ThinkSystem', 'Cisco UCS', 'Supermicro SuperServer'],
  'Camera': ['Canon EOS R6', 'Sony Alpha a7 IV', 'Nikon Z6 II', 'GoPro Hero 12', 'Logitech Brio Webcam'],
  'Scanner': ['Fujitsu ScanSnap', 'Canon imageFORMULA', 'Epson WorkForce', 'Brother ADS', 'HP ScanJet'],
  'Cable': ['HDMI 2.1 Cable', 'USB-C Thunderbolt 4', 'Cat6 Ethernet 5m', 'DisplayPort 1.4', 'VGA Cable'],
  'Other': ['Docking Station', 'UPS Power Backup', 'External Hard Drive', 'Webcam', 'Speakerphone']
};

export function AssetModal({ asset, onClose, onSaved }: AssetModalProps) {
  const [name, setName] = useState(asset.name);
  const [type, setType] = useState(asset.type);
  const [status, setStatus] = useState(asset.status);
  const [serial, setSerial] = useState(asset.serial_number);
  const [assignedTo, setAssignedTo] = useState(asset.assigned_to || '');
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'qr'>('details');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic Catalog State
  const [combinedModels, setCombinedModels] = useState<string[]>([]);
  const [isCustomModel, setIsCustomModel] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      const { data } = await supabase.from('employees').select('full_name');
      if (data) setEmployees(data);
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchAndMergeModels() {
      const seedList = SEED_CATALOG[type] || [];
      const { data } = await supabase.from('assets').select('name').eq('type', type);
      
      let dbList: string[] = [];
      if (data) dbList = data.map(item => item.name);

      const uniqueSet = new Set([...seedList, ...dbList]);
      const finalSortedList = Array.from(uniqueSet).sort();
      setCombinedModels(finalSortedList);

      if (name && !finalSortedList.includes(name)) {
         // Keep custom name
      } else if (finalSortedList.length === 0) {
         setIsCustomModel(true);
      }
    }
    fetchAndMergeModels();
  }, [type]); 

  // Removed isAccessory restriction check so anything can be assigned.
  useEffect(() => {
    if (status === 'Maintenance' || status === 'Available') {
      setAssignedTo(''); 
    }
  }, [status]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a Model Name.");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name, 
        type, 
        status,
        serial_number: serial,
        assigned_to: (status === 'In Use') ? assignedTo : null 
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

  const isAssignmentDisabled = status === 'Maintenance' || status === 'Available';

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>Details</button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'qr' ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>QR Code</button>
          <button onClick={onClose} type="button" className="px-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={20} className="stroke-[2]" /></button>
        </div>

        <div className="p-6">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Asset Category</label>
                  <select 
                    className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-medium text-gray-900 shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer" 
                    value={type} 
                    onChange={e => {
                        setType(e.target.value);
                        setIsCustomModel(false);
                        setName('');
                    }}
                  >
                    <option>Laptop</option><option>PC</option><option>Phone</option><option>Tablet</option><option>Monitor</option><option>Keyboard</option><option>Mouse</option><option>Headset</option><option>Printer</option><option>Projector</option><option>Server</option><option>Camera</option><option>Scanner</option><option>Cable</option><option>Other</option>
                  </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                    <select className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-medium text-gray-900 shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
              </div>

              {combinedModels.length > 0 && !isCustomModel ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Model</label>
                  <select 
                    className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-medium text-gray-900 shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    value={name} 
                    onChange={e => {
                      if(e.target.value === 'CUSTOM_ENTRY') { setIsCustomModel(true); setName(''); }
                      else { setName(e.target.value); }
                    }}
                  >
                    <option value="">-- Select {type} --</option>
                    {combinedModels.map(model => (<option key={model} value={model}>{model}</option>))}
                    <option value="CUSTOM_ENTRY" className="text-blue-600 font-medium">+ Create New Model...</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Model Name <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-medium text-gray-900 shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={name} onChange={e => setName(e.target.value)} placeholder={`e.g. ${type} Model Name`} autoFocus />
                    {combinedModels.length > 0 && (<button onClick={() => setIsCustomModel(false)} className="text-xs text-blue-600 font-medium hover:underline whitespace-nowrap px-2">Select Existing</button>)}
                  </div>
                </div>
              )}

              <div><label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Serial Number / ID</label><input className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-mono text-gray-900 shadow-sm uppercase focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:font-sans placeholder:font-medium placeholder:normal-case placeholder:text-gray-400" value={serial} onChange={e => setSerial(e.target.value)} placeholder="Unique Identifier..." /></div>

              {/* Removed isAccessory restriction so everyone can be assigned */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center">Assigned To {isAssignmentDisabled && <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-2 text-[10px] border border-gray-200">Locked</span>}</label>
                <select className={`w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer ${isAssignmentDisabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}`} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} disabled={isAssignmentDisabled}>
                  <option value="">-- {isAssignmentDisabled ? 'Status must be In Use' : 'Not Assigned'} --</option>
                  {employees.map(emp => (<option key={emp.full_name} value={emp.full_name}>{emp.full_name}</option>))}
                </select>
              </div>
              
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                {asset.id !== 0 && (<button onClick={handleDelete} type="button" className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18} className="stroke-[2]" /></button>)}
                <div className="flex gap-3 ml-auto">
                   <button onClick={onClose} type="button" className="px-4 py-2 text-gray-600 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors shadow-sm">Cancel</button>
                   <button onClick={handleSave} type="button" disabled={isSaving} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-800 transition-colors flex items-center gap-2"><Save size={16} /> Save</button>
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
