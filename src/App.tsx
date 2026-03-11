import { motion } from 'framer-motion';
import { AlertTriangle, Box, CheckCircle, Menu, Plus, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AllAssets } from './components/AllAssets';
import { AssetModal } from './components/AssetModal';
import { EmployeeList } from './components/EmployeeList';
import { HistoryModal } from './components/HistoryModal';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/CustomCursor';
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
  // Removed unused loading state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const { data, error } = await supabase.from('assets').select('*').order('id');
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  const logHistory = async (assetId: number, action: string, details: string) => {
    await supabase.from('asset_history').insert({
        asset_id: assetId,
        action: action,
        details: details
    });
  };

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
    setSelectedAsset({
      id: 0, 
      name: '', 
      type: 'Laptop', 
      status: 'Available', 
      serial_number: '', 
      assigned_to: null
    } as Asset);
  }


  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const inUseAssets = assets.filter(a => a.status === 'In Use').length;
  const brokenAssets = assets.filter(a => a.status === 'Maintenance').length;

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden relative font-sans">
      <CustomCursor />
      {/* GLOBAL ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
          <div className="absolute top-20 -right-20 w-[600px] h-[600px] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" style={{ animationDelay: "2s" }}></div>
          <div className="absolute -bottom-60 left-1/4 w-[700px] h-[700px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 z-40 transition-all duration-300">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xs ring-2 ring-white">ET</div>
            <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">EQUIP-TRACK</h1>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">DEV BY AKSHAT</p>
            </div>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all"><Menu size={20} className="stroke-[2.5]" /></button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
           <div>
             <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-sm">ET</div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">EQUIP-TRACK</h1>
             </div>
             <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Enterprise Edition</p>
           </div>
           <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            <div onClick={() => setSidebarOpen(false)}>
                <Navbar currentView={currentView} onNavigate={setCurrentView} />
            </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
           <div className="bg-gray-50 text-gray-600 px-3 py-2 rounded-md border border-gray-200 text-xs font-medium text-center">
               Built by Akshat
           </div>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"></div>}

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        
        {currentView === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* HERO BANNER */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
            >
               <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 to-transparent pointer-events-none rounded-bl-full"></div>
               
               <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-50 text-xs font-semibold text-green-700 border border-green-200/50 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> System Online
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, Akshat</h2>
                  <p className="text-gray-500 font-medium">Manage and track your organization's equipment inventory.</p>
               </div>
               
               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleCreate} 
                 className="relative z-10 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
               >
                 <Plus size={18} /> 
                 Register Asset
               </motion.button>
            </motion.div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <StatCard 
                 title="Total Assets" value={totalAssets} icon={<Box size={20} />} 
                 color="text-gray-700" bg="bg-gray-100" delay={0.05} 
               />
               <StatCard 
                 title="Available" value={availableAssets} icon={<CheckCircle size={20} />} 
                 color="text-emerald-700" bg="bg-emerald-50" delay={0.1} 
               />
               <StatCard 
                 title="Deployed" value={inUseAssets} icon={<Users size={20} />} 
                 color="text-blue-700" bg="bg-blue-50" delay={0.15} 
               />
               <StatCard 
                 title="Maintenance" value={brokenAssets} icon={<AlertTriangle size={20} />} 
                 color="text-rose-700" bg="bg-rose-50" delay={0.2} 
               />
            </div>
          </motion.div>
        )}

        {/* --- ALL ASSETS PAGE --- */}
        {currentView === 'all-assets' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-6 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-gray-900">All Assets</h2><p className="text-gray-500 text-sm">All devices and accessories without limits</p></div>
                <button onClick={handleCreate} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2 font-bold"><Plus size={20} /> Add Asset</button>
             </div>
             <AllAssets assets={assets} onEdit={setSelectedAsset} onDelete={handleDeleteAsset} onCheckIn={handleCheckIn} onMaintenance={handleMaintenance} onHistory={setHistoryAsset} title="Asset" />
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

function StatCard({ title, value, icon, color, bg, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4 }}
      className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between`}
    >
       <div>
         <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
         <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
       </div>
       <div className={`h-12 w-12 rounded-lg ${bg} ${color} flex items-center justify-center`}>
         {icon}
       </div>
    </motion.div>
  );
}

export default App;