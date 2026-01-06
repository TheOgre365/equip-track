import { motion } from 'framer-motion';
import { ChevronRight, Laptop, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AllAssets } from './components/AllAssets'; // Imported and now USED below
import { AssetModal } from './components/AssetModal';
import { EmployeeList } from './components/EmployeeList'; // Imported and now USED below
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
  
  // State to track which page we are on
  const [currentView, setCurrentView] = useState('dashboard'); 

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').order('id');
      
      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setAssets(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
           <h1 className="text-xl font-bold text-blue-600 tracking-wider">EQUIP-TRACK</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Navbar currentView={currentView} onNavigate={setCurrentView} /> 
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        
        {/* --- VIEW 1: DASHBOARD --- */}
        {currentView === 'dashboard' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500 text-sm">Manage your company assets</p>
              </div>
              <button 
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                + Add Asset
              </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {assets.length} Items
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {assets.map((asset, index) => (
                    <motion.li 
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setSelectedAsset(asset)}
                      className="p-4 hover:bg-gray-50 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${asset.type === 'Laptop' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                          {asset.type === 'Laptop' ? <Laptop size={20} /> : <Smartphone size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{asset.name}</p>
                          <p className="text-xs text-gray-500">#{asset.id} - {asset.serial_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          asset.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{asset.status}</span>
                        <ChevronRight className="text-gray-300 group-hover:text-gray-500" size={20} />
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* --- VIEW 2: ALL ASSETS (Added This!) --- */}
        {/* --- VIEW 2: ALL ASSETS --- */}
{currentView === 'all-assets' && (
   <AllAssets 
     assets={assets} 
     onEdit={setSelectedAsset} // <--- Add this line!
   />
)}

        {/* --- VIEW 3: EMPLOYEES (Fixed This!) --- */}
        {currentView === 'employees' && (
           <EmployeeList />
        )}

         {/* --- VIEW 4: SETTINGS --- */}
         {currentView === 'settings' && (
           <div className="text-center mt-20">
             <h2 className="text-3xl font-bold text-gray-300">System Settings</h2>
             <p className="text-gray-400 mt-2">Coming Soon...</p>
           </div>
        )}

      </main>

      {/* MODAL */}
      {selectedAsset && (
        <AssetModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          onSaved={fetchAssets} 
        />
      )}
    </div>
  );
}

export default App;