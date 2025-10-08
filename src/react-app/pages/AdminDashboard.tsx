import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import {
  Users,
  DollarSign,
  Star,
  Award,
  BarChart3,
  Activity,
  Target,
  Eye,
  UserCheck,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import type { Staff } from '@/shared/types';

interface PerformanceData {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  role: string;
  date: string;
  orders_served: number;
  total_sales: number;
  tables_served: number;
  shift_duration_minutes: number;
  customer_rating_avg: number;
  tips_earned: number;
  sales_per_hour: number;
  orders_per_hour: number;
}

interface PerformanceSummary {
  today: {
    active_staff: number;
    total_orders_today: number;
    total_sales_today: number;
    avg_rating_today: number;
  };
  yesterday: {
    total_orders_yesterday: number;
    total_sales_yesterday: number;
  };
  topPerformers: Array<{
    first_name: string;
    last_name: string;
    role: string;
    total_sales: number;
    orders_served: number;
    customer_rating_avg: number;
  }>;
}

interface RolePerformance {
  role: string;
  staff_count: number;
  total_orders: number;
  total_sales: number;
  avg_rating: number;
  total_tips: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [rolePerformance, setRolePerformance] = useState<RolePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'staff' | 'roles'>('overview');
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

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
      fetchPerformanceData();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const [staffRes, summaryRes, roleRes] = await Promise.all([
        fetch('/api/performance/staff'),
        fetch('/api/performance/summary'),
        fetch('/api/performance/by-role')
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setPerformanceData(staffData);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setRolePerformance(roleData);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'waiter': return 'bg-green-100 text-green-800';
      case 'receptionist': return 'bg-pink-100 text-pink-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPerformanceLevel = (rating: number) => {
    if (rating >= 4.5) return { level: 'Excellent', color: 'text-green-600', icon: '🌟' };
    if (rating >= 4.0) return { level: 'Good', color: 'text-blue-600', icon: '👍' };
    if (rating >= 3.5) return { level: 'Average', color: 'text-yellow-600', icon: '👌' };
    if (rating >= 3.0) return { level: 'Fair', color: 'text-orange-600', icon: '⚠️' };
    return { level: 'Needs Improvement', color: 'text-red-600', icon: '❌' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const selectedStaff = performanceData.find(s => s.id === selectedStaffId);


  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const salesChange = summary && summary.today.total_sales_today > 0 && summary.yesterday.total_sales_yesterday > 0
    ? ((summary.today.total_sales_today - summary.yesterday.total_sales_yesterday) / summary.yesterday.total_sales_yesterday) * 100
    : 0;

  const ordersChange = summary && summary.today.total_orders_today > 0 && summary.yesterday.total_orders_yesterday > 0
    ? ((summary.today.total_orders_today - summary.yesterday.total_orders_yesterday) / summary.yesterday.total_orders_yesterday) * 100
    : 0;

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Staff Performance Dashboard</h1>
          <p className="text-purple-100">Monitor and analyze your team's performance in real-time</p>
        </div>

        {/* View Selector */}
        <div className="flex space-x-2 bg-white rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'overview' 
                ? 'bg-purple-500 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('staff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'staff' 
                ? 'bg-purple-500 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Staff Performance
          </button>
          <button
            onClick={() => setSelectedView('roles')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'roles' 
                ? 'bg-purple-500 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            By Role
          </button>
        </div>

        {/* Overview Tab */}
        {selectedView === 'overview' && summary && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Today's Sales</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {formatCurrency(summary.today.total_sales_today)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {salesChange > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${salesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(salesChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-slate-500 ml-2">vs yesterday</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Orders Today</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{summary.today.total_orders_today}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {ordersChange > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(ordersChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-slate-500 ml-2">vs yesterday</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Staff</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{summary.today.active_staff}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-slate-500">Currently on duty</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {summary.today.avg_rating_today.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-slate-500">Customer satisfaction</span>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    Today's Top Performers
                  </h3>
                </div>
              </div>
              <div className="p-6">
                {summary.topPerformers.length > 0 ? (
                  <div className="space-y-4">
                    {summary.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {performer.first_name} {performer.last_name}
                            </p>
                            <p className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(performer.role)}`}>
                              {performer.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{formatCurrency(performer.total_sales)}</p>
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span>{performer.orders_served} orders</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {performer.customer_rating_avg.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No performance data available for today</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Staff Performance Tab */}
        {selectedView === 'staff' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Individual Staff Performance (Last 7 Days)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-900">Staff Member</th>
                    <th className="text-left p-4 font-medium text-slate-900">Role</th>
                    <th className="text-left p-4 font-medium text-slate-900">Orders</th>
                    <th className="text-left p-4 font-medium text-slate-900">Sales</th>
                    <th className="text-left p-4 font-medium text-slate-900">Sales/Hour</th>
                    <th className="text-left p-4 font-medium text-slate-900">Rating</th>
                    <th className="text-left p-4 font-medium text-slate-900">Tips</th>
                    <th className="text-left p-4 font-medium text-slate-900">Performance</th>
                    <th className="text-left p-4 font-medium text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {performanceData.map((staff, index) => {
                    const performance = getPerformanceLevel(staff.customer_rating_avg || 0);
                    return (
                      <tr key={`${staff.id}-${index}`} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">{staff.first_name} {staff.last_name}</p>
                            <p className="text-sm text-slate-500">{staff.employee_id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-900">{staff.orders_served || 0}</td>
                        <td className="p-4 font-medium text-slate-900">{formatCurrency(staff.total_sales || 0)}</td>
                        <td className="p-4 text-slate-900">{formatCurrency(staff.sales_per_hour || 0)}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-slate-900">{(staff.customer_rating_avg || 0).toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-900">{formatCurrency(staff.tips_earned || 0)}</td>
                        <td className="p-4">
                          <div className={`flex items-center ${performance.color}`}>
                            <span className="mr-1">{performance.icon}</span>
                            <span className="text-sm font-medium">{performance.level}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => setSelectedStaffId(staff.id)}
                            className="text-purple-600 hover:text-purple-900 text-sm font-medium flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {performanceData.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No staff performance data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Performance Tab */}
        {selectedView === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rolePerformance.map((role, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 capitalize">{role.role}s</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(role.role)}`}>
                      {role.staff_count} staff
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Total Orders</p>
                      <p className="text-xl font-bold text-slate-900">{role.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Sales</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(role.total_sales)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Avg Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <p className="font-medium text-slate-900">{role.avg_rating.toFixed(1)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total Tips</p>
                      <p className="font-medium text-slate-900">{formatCurrency(role.total_tips)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {rolePerformance.length === 0 && (
              <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-500">No role performance data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staff Details Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedStaff.first_name} {selectedStaff.last_name}'s Performance
              </h3>
              <button onClick={() => setSelectedStaffId(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Total Sales</p>
                <p className="text-xl font-bold">{formatCurrency(selectedStaff.total_sales || 0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Orders Served</p>
                <p className="text-xl font-bold">{selectedStaff.orders_served || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Avg. Rating</p>
                <p className="text-xl font-bold">{(selectedStaff.customer_rating_avg || 0).toFixed(1)}</p>
              </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Tips Earned</p>
                <p className="text-xl font-bold">{formatCurrency(selectedStaff.tips_earned || 0)}</p>
              </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Sales/Hour</p>
                <p className="text-xl font-bold">{formatCurrency(selectedStaff.sales_per_hour || 0)}</p>
              </div>
               <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Orders/Hour</p>
                <p className="text-xl font-bold">{(selectedStaff.orders_per_hour || 0).toFixed(2)}</p>
              </div>
            </div>
             <div className="p-6 border-t border-slate-200 text-right">
                <button
                  onClick={() => setSelectedStaffId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

