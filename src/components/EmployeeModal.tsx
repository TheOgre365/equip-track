import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Employee {
  id: number;
  full_name: string;
  role: string;
  department: string;
}

interface EmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}

export function EmployeeModal({ employee, onClose, onSaved }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>(employee);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { id, ...dataToSend } = formData;

      if (employee.id === 0) {
        // Create New Employee
        const { error } = await supabase.from('employees').insert([dataToSend]);
        if (error) throw error;
      } else {
        // Update Existing Employee
        const { error } = await supabase
          .from('employees')
          .update(dataToSend)
          .eq('id', employee.id);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from('employees').delete().eq('id', employee.id);
    if (!error) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">
            {employee.id === 0 ? 'Add Employee' : 'Edit Employee'}
          </h3>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input name="role" required value={formData.role} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Developer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input name="department" required value={formData.department} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Engineering" />
          </div>

          <div className="flex justify-between pt-4 mt-2 border-t border-gray-100">
             {employee.id !== 0 ? (
               <button type="button" onClick={handleDelete} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>
             ) : <div></div>}
             <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                  {loading ? 'Saving...' : 'Save Employee'}
                </button>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}