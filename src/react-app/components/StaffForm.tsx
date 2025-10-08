import { useState } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import type { Staff, StaffRole } from '@/shared/types';

interface StaffFormProps {
  staff?: Staff;
  onClose: () => void;
  onSave: (staffData: Partial<Staff> & { password?: string }) => Promise<void>;
}

export default function StaffForm({ staff, onClose, onSave }: StaffFormProps) {
  const [formData, setFormData] = useState({
    employee_id: staff?.employee_id || '',
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: (staff?.role || 'waiter') as StaffRole,
    pin: staff?.pin || '',
    password: '',
    is_active: staff ? staff.is_active !== 0 : true,
  });

  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles: { value: StaffRole; label: string }[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'chef', label: 'Chef' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Correctly convert the is_active boolean to a number (1 or 0)
      const staffData: Partial<Staff> & { password?: string } = {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      };
      
      // Only include the password in the payload if it has been entered
      if (!staffData.password) {
        delete staffData.password;
      }

      await onSave(staffData);
      onClose();
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('Failed to save staff member. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">
            {staff ? 'Edit Staff Member' : 'Add Staff Member'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID *</label>
              <input type="text" required value={formData.employee_id} onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="EMP001"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
              <select required value={formData.role} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as StaffRole }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                {roles.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
              <input type="text" required value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
              <input type="text" required value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder={staff ? "Leave blank to keep current" : "Set initial password"}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">PIN (4 digits)</label>
              <div className="relative">
                <input type={showPin ? "text" : "password"} value={formData.pin} onChange={(e) => { const value = e.target.value.replace(/\D/g, '').slice(0, 4); setFormData(prev => ({ ...prev, pin: value })); }} className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="1234" maxLength={4}/>
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {staff && (<div className="flex items-center"><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 text-yellow-500 bg-white border-slate-300 rounded focus:ring-yellow-500"/><label htmlFor="is_active" className="ml-2 text-sm text-slate-700">Active staff member</label></div>)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button><button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-semibold disabled:opacity-50 flex items-center justify-center">{loading ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>) : (<><Save className="w-4 h-4 mr-2" />{staff ? 'Update' : 'Create'} Staff Member</>)}</button></div>
        </form>
      </div>
    </div>
  );
}

