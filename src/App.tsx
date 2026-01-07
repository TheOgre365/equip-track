import { motion } from 'framer-motion';
import { AlertTriangle, Box, CheckCircle, Menu, Plus, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AllAssets } from './components/AllAssets';
import { AssetModal } from './components/AssetModal';
import { EmployeeList } from './components/EmployeeList';
import { HistoryModal } from './components/HistoryModal';
import { Navbar } from './components/Navbar';
import { supabase } from './supabaseClient';

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  assigned_to: string | null;
  serial_number: string;
}

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').order('id');
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // --- LOGGING HELPER ---
  const logHistory = async (assetId: number, action: string, details: string) => {
    await supabase.from('asset_history').insert({
        asset_id: assetId,
        action: action,
        details: details
    });
  };

  // --- ACTIONS ---
  const handleDeleteAsset = async (id: number) => {
    if (!confirm("Are you sure you want to DELETE this item?")) return;
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) fetchAssets();
  };

  const handleCheckIn = async (asset: Asset) => {
    if (!confirm(`Return ${asset.name}?`)) return;
    const { error } = await supabase.from('assets').update({
        status: 'Available',
        assigned_to: null
    }).eq('id', asset.id);
    if (!error) {
        await logHistory(asset.id, 'Returned', `Returned from ${asset.assigned_to}`);
        alert("Returned successfully!");
        fetchAssets();
    }
  };

  const handleMaintenance = async (asset: Asset) => {
    const { error } = await supabase.from('assets').update({
        status: 'Maintenance',
        assigned_to: null
    }).eq('id', asset.id);
    if (!error) {
        await logHistory(asset.id, 'Maintenance', 'Marked as broken/maintenance');
        fetchAssets();
    }
  };

  const handleCreate = () => {
    const isAccessoryView = currentView === 'accessories';
    const defaultType = isAccessoryView ? 'Keyboard' : 'Laptop';
    
    setSelectedAsset({
      id: 0, 
      name: '', 
      type: defaultType, 
      status: 'Available', 
      serial_number: '', 
      assigned_to: null
    } as Asset);
  }

  const accessoryTypes = ['Keyboard', 'Mouse', 'Mouse Pad', 'Monitor', 'Headset', 'Cable', 'Accessory', 'Other'];
  const mainAssetsList = assets.filter(a => !accessoryTypes.includes(a.type));
  const accessoryList = assets.filter(a => accessoryTypes.includes(a.type));

  const totalAssets = mainAssetsList.length;
  const availableAssets = mainAssetsList.filter(a => a.status === 'Available').length;
  const inUseAssets = mainAssetsList.filter(a => a.status === 'In Use').length;
  const brokenAssets = mainAssetsList.filter(a => a.status === 'Maintenance').length;

  return (
    <div className="flex h-screen w-screen bg-[#F3F4F6] overflow-hidden relative font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <h1 className="text-lg font-bold text-blue-600 tracking-wider">EQUIP-TRACK</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
           <div><h1 className="text-xl font-bold text-blue-600 tracking-wider">EQUIP-TRACK</h1><p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">ENTERPRISE EDITION</p></div>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-2"><div onClick={() => setSidebarOpen(false)}><Navbar currentView={currentView} onNavigate={setCurrentView} /></div></div>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"></div>}

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        
        {currentView === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Welcome back, Akshat 👋</h2>
                  <p className="text-blue-100 opacity-90">Inventory Overview (Main Assets Only)</p>
               </div>
               <button onClick={handleCreate} className="relative z-10 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2">
                 <Plus size={20} /> Register Asset
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
               <StatCard title="Main Assets" value={totalAssets} icon={<Box size={24} />} color="text-blue-600" bg="bg-blue-50" />
               <StatCard title="Available" value={availableAssets} icon={<CheckCircle size={24} />} color="text-green-600" bg="bg-green-50" />
               <StatCard title="Deployed" value={inUseAssets} icon={<Users size={24} />} color="text-purple-600" bg="bg-purple-50" />
               <StatCard title="Maintenance" value={brokenAssets} icon={<AlertTriangle size={24} />} color="text-red-600" bg="bg-red-50" />
            </div>
          </motion.div>
        )}

        {/* --- MAIN ASSETS (TITLE = DEVICE) --- */}
        {currentView === 'all-assets' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-gray-900">Main Assets</h2><p className="text-gray-500 text-sm">Laptops, Phones, Tablets & PCs</p></div>
                <button onClick={handleCreate} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2 font-bold"><Plus size={20} /> Add Asset</button>
             </div>
             <AllAssets 
               assets={mainAssetsList} 
               onEdit={setSelectedAsset} 
               onDelete={handleDeleteAsset}
               onCheckIn={handleCheckIn}
               onMaintenance={handleMaintenance}
               onHistory={setHistoryAsset}
               title="Device" // <--- HEADER WILL SAY "DEVICE"
             />
           </div>
        )}

        {/* --- ACCESSORIES (TITLE = ACCESSORY) --- */}
        {currentView === 'accessories' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-gray-900">Accessories</h2><p className="text-gray-500 text-sm">Keyboards, Mice, Monitors, etc.</p></div>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2 font-bold"><Plus size={20} /> Add Accessory</button>
             </div>
             <AllAssets 
                assets={accessoryList} 
                onEdit={setSelectedAsset} 
                onDelete={handleDeleteAsset}
                onCheckIn={handleCheckIn}
                onMaintenance={handleMaintenance}
                onHistory={setHistoryAsset}
                title="Accessory" // <--- HEADER WILL SAY "ACCESSORY"
             />
           </div>
        )}

        {currentView === 'employees' && <EmployeeList />}
        {currentView === 'settings' && <div className="text-center mt-20 text-gray-400">Settings Locked</div>}
      </main>

      {selectedAsset && <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} onSaved={fetchAssets} />}
      {historyAsset && <HistoryModal asset={historyAsset} onClose={() => setHistoryAsset(null)} />}
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
       <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-extrabold text-gray-800">{value}</h3></div>
       <div className={`h-10 w-10 rounded-full ${bg} ${color} flex items-center justify-center`}>{icon}</div>
    </div>
  );
}

export default App;