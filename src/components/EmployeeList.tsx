import { motion } from 'framer-motion';
import { Briefcase, Laptop, Plus } from 'lucide-react';
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
    // 1. Fetch Employees
    const { data: empData } = await supabase.from('employees').select('*').order('id');
    if (empData) setEmployees(empData);

    // 2. Fetch Assets (so we can match them)
    const { data: assetData } = await supabase.from('assets').select('id, name, assigned_to');
    if (assetData) setAssignedAssets(assetData as any);
  }

  const handleCreate = () => {
    setSelectedEmployee({ id: 0, full_name: '', role: '', department: '' } as Employee);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
          <p className="text-gray-500 text-sm">Manage staff and view assigned devices</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp, i) => {
          // LOGIC: Find assets assigned to this person
          const myAssets = assignedAssets.filter(a => a.assigned_to === emp.full_name);

          return (
            <motion.div 
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {emp.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{emp.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Briefcase size={14} />
                    <span>{emp.role}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Devices Section */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Assigned Devices</p>
                {myAssets.length > 0 ? (
                  <div className="space-y-2">
                    {myAssets.map(asset => (
                      <div key={asset.id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                         <Laptop size={14} className="text-blue-500"/> 
                         {asset.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No devices assigned</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal for Add/Edit */}
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