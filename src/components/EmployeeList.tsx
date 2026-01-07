import { motion } from 'framer-motion';
import { CheckCircle, Laptop, Percent, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { EmployeeModal } from './EmployeeModal';

interface Employee {
  id: number;
  full_name: string;
  role: string;
  department: string;
}

interface Asset {
  id: number;
  name: string;
  assigned_to: string;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: empData } = await supabase.from('employees').select('*').order('id');
    if (empData) setEmployees(empData);

    const { data: assetData } = await supabase.from('assets').select('id, name, assigned_to');
    if (assetData) setAssignedAssets(assetData as any);
  }

  const handleCreate = () => {
    setSelectedEmployee({ id: 0, full_name: '', role: '', department: '' } as Employee);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to remove this employee?")) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) fetchData(); 
    else alert("Error: " + error.message);
  }

  // --- STATS CALCULATION ---
  const totalStaff = employees.length;
  // Get list of names who have assets
  const employeesWithAssets = new Set(assignedAssets.map(a => a.assigned_to).filter(Boolean));
  // Count how many are NOT in that set
  const availableStaff = employees.filter(e => !employeesWithAssets.has(e.full_name)).length;
  const deploymentRate = totalStaff > 0 ? Math.round(((totalStaff - availableStaff) / totalStaff) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. NEW STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Staff</p>
              <h3 className="text-2xl font-extrabold text-gray-800">{totalStaff}</h3>
           </div>
           <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Available for Deploy</p>
              <h3 className="text-2xl font-extrabold text-gray-800">{availableStaff}</h3>
           </div>
           <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Deployment Rate</p>
              <h3 className="text-2xl font-extrabold text-gray-800">{deploymentRate}%</h3>
           </div>
           <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Percent size={20}/></div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">People Directory</h2>
          <p className="text-gray-500 text-sm">Manage staff and view assignments</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition font-medium shadow-md"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp, i) => {
          const myAssets = assignedAssets.filter(a => a.assigned_to === emp.full_name);
          const hasDevices = myAssets.length > 0;

          return (
            <motion.div 
              key={emp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Status Indicator Line */}
              <div className={`absolute top-0 left-0 w-full h-1 ${hasDevices ? 'bg-blue-500' : 'bg-green-500'}`}></div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg">
                      {emp.full_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{emp.full_name}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{emp.role}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => handleDelete(e, emp.id)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                >
                    <Trash2 size={18} />
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                 <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold border border-gray-100">
                    {emp.department}
                 </span>
                 {!hasDevices && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wide">Available</span>
                 )}
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Assets</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${hasDevices ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {myAssets.length}
                    </span>
                </div>
                
                {myAssets.length > 0 ? (
                  <div className="space-y-2">
                    {myAssets.slice(0, 3).map(asset => (
                      <div key={asset.id} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                         <Laptop size={12} className="text-blue-500"/> 
                         <span className="truncate">{asset.name}</span>
                      </div>
                    ))}
                    {myAssets.length > 3 && (
                        <p className="text-xs text-center text-gray-400 mt-1">+{myAssets.length - 3} more items...</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400 italic">No devices assigned</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedEmployee && (
        <EmployeeModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
          onSaved={fetchData} 
        />
      )}
    </div>
  );
} 