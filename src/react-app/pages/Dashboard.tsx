import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { 
  Users, 
  UtensilsCrossed, 
  BarChart3, 
  ShoppingCart,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import type { Staff } from '@/shared/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [stats, setStats] = useState([
    {
      name: 'Today\'s Revenue',
      value: 'KSh 0',
      change: '+0%',
      changeType: 'neutral',
      icon: DollarSign,
    },
    {
      name: 'Active Orders',
      value: '0',
      change: '+0',
      changeType: 'neutral',
      icon: ShoppingCart,
    },
    {
      name: 'Tables Occupied',
      value: '0/0',
      change: '0%',
      changeType: 'neutral',
      icon: UtensilsCrossed,
    },
    {
      name: 'Staff on Duty',
      value: '0',
      change: '+0',
      changeType: 'neutral',
      icon: Users,
    },
  ]);
  const [recentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [tablesRes, staffRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/staff')
      ]);

      const newStats = [...stats];

      if (tablesRes.ok) {
        const tables = await tablesRes.json();
        const occupiedTables = tables.filter((t: any) => t.is_occupied).length;
        const totalTables = tables.length;
        const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
        
        newStats[2] = {
          ...newStats[2],
          value: `${occupiedTables}/${totalTables}`,
          change: `${occupancyRate}%`
        };
      }

      if (staffRes.ok) {
        const staff = await staffRes.json();
        const activeStaff = staff.filter((s: any) => s.is_active).length;
        
        newStats[3] = {
          ...newStats[3],
          value: activeStaff.toString()
        };
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-black to-gray-900 rounded-xl p-6 text-white border border-yellow-500/20">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user.staff?.first_name}!
          </h2>
          <p className="text-yellow-200">
            Here's what's happening at your restaurant today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <stat.icon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500 ml-2">from yesterday</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
                <button className="text-sm text-slate-600 hover:text-slate-900">View all</button>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-900">{order.id}</span>
                      <span className="text-sm text-slate-500">{order.table}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{order.items} items</span>
                    <span className="font-medium text-slate-900">{order.total}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-slate-400 mr-1" />
                    <span className="text-xs text-slate-500">{order.time}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No recent orders</p>
                  <p className="text-slate-400 text-sm">Orders will appear here once you start taking them</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <button 
                  onClick={() => navigate('/pos')}
                  className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <ShoppingCart className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-slate-900">New Order</span>
                </button>
                <button 
                  onClick={() => navigate('/tables')}
                  className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <UtensilsCrossed className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-slate-900">Manage Tables</span>
                </button>
                <button 
                  onClick={() => navigate('/staff')}
                  className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Users className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-slate-900">Staff Management</span>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <BarChart3 className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-slate-900">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Welcome to Maria Havens</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your restaurant management system is ready. Start by taking orders or managing your menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
