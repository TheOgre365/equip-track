import { motion } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface HistoryEvent {
  id: number;
  action: string;
  details: string;
  created_at: string;
}

interface HistoryModalProps {
  asset: { id: number; name: string };
  onClose: () => void;
}

export function HistoryModal({ asset, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data } = await supabase
        .from('asset_history')
        .select('*')
        .eq('asset_id', asset.id)
        .order('created_at', { ascending: false });
      
      setHistory(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, [asset.id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Asset Timeline</h2>
            <p className="text-sm text-gray-500">History for <span className="text-blue-600 font-bold">{asset.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Activity className="mx-auto text-gray-300 mb-2" size={32} />
               <p className="text-gray-400 text-sm">No history recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {history.map((event) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className={`w-3 h-3 rounded-full ${
                        event.action === 'Returned' ? 'bg-yellow-500' :
                        event.action === 'Maintenance' ? 'bg-red-500' :
                        event.action === 'Deployed' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900 text-sm">{event.action}</div>
                      <time className="font-mono text-[10px] text-gray-400">
                        {new Date(event.created_at).toLocaleDateString()}
                      </time>
                    </div>
                    <div className="text-gray-500 text-xs">{event.details}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}