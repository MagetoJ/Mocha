import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import StaffForm from '@/react-app/components/StaffForm';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Clock,
  Mail,
  Phone,
  User
} from 'lucide-react';
import type { Staff, StaffRole } from '@/shared/types';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('mariaHavens_user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchStaff();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (staffData: Partial<Staff>) => {
    try {
      const url = selectedStaff ? `/api/staff/${selectedStaff.id}` : '/api/staff';
      const method = selectedStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });

      if (response.ok) {
        await fetchStaff();
        setShowStaffForm(false);
        setSelectedStaff(undefined);
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return;
    
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStaff();
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowStaffForm(true);
  };

  const handleAddStaff = () => {
    setSelectedStaff(undefined);
    setShowStaffForm(true);
  };

  const filteredStaff = staff.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: StaffRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      waiter: 'bg-green-100 text-green-800',
      receptionist: 'bg-purple-100 text-purple-800',
      chef: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-slate-100 text-slate-800';
  };

  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return User;
      default: return User;
    }
  };

  if (loading) {
    return (
      <Layout title="Staff Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_staff">
      <Layout title="Staff Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
            <p className="text-slate-600">Manage your restaurant staff and their roles</p>
          </div>
          <button
            onClick={handleAddStaff}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredStaff.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <RoleIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-sm text-slate-500">ID: {member.employee_id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditStaff(member)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStaff(member.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Role</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>

                  {member.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{member.email}</span>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{member.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {member.pin && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-500">PIN configured</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredStaff.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No staff members found</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding your first staff member.'}
            </p>
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      {showStaffForm && (
        <StaffForm
          staff={selectedStaff}
          onClose={() => {
            setShowStaffForm(false);
            setSelectedStaff(undefined);
          }}
          onSave={handleSaveStaff}
        />
      )}
    </Layout>
    </ProtectedRoute>
  );
}
