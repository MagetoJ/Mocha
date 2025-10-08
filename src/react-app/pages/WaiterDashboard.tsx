import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import { 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface WaiterStats {
  todaySales: number;
  ordersCount: number;
  averageOrderValue: number;
  customerRating: number;
  activeOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  table_number: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  created_at: string;
  items_count: number;
}

export default function WaiterDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<WaiterStats>({
    todaySales: 0,
    ordersCount: 0,
    averageOrderValue: 0,
    customerRating: 0,
    activeOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; staff: any } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mariaHavens_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    fetchWaiterData();
  }, []);

  const fetchWaiterData = async () => {
    try {
      const response = await fetch('/api/waiter/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('Failed to fetch waiter data:', error);
      // Mock data for demonstration
      setStats({
        todaySales: 1250.75,
        ordersCount: 18,
        averageOrderValue: 69.49,
        customerRating: 4.7,
        activeOrders: 3,
        completedOrders: 15
      });
      
      setRecentOrders([
        {
          id: 1,
          order_number: 'ORD-025',
          table_number: 'T-08',
          total: 89.50,
          status: 'ready',
          created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          items_count: 3
        },
        {
          id: 2,
          order_number: 'ORD-024',
          table_number: 'T-12',
          total: 156.25,
          status: 'preparing',
          created_at: new Date(Date.now() - 25 * 60000).toISOString(),
          items_count: 5
        },
        {
          id: 3,
          order_number: 'ORD-023',
          table_number: 'T-03',
          total: 45.75,
          status: 'completed',
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
          items_count: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return `${elapsed}m ago`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['waiter']} requiredPermission="pos">
        <Layout title="Waiter Dashboard">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['waiter']} requiredPermission="pos">
      <Layout title="Waiter Dashboard">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome, {user?.staff?.first_name}!
                </h1>
                <p className="text-slate-600">Here's your performance today</p>
              </div>
              <button
                onClick={() => navigate('/pos')}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Open POS</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Today's Sales"
              value={`KSh ${stats.todaySales.toFixed(2)}`}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatCard
              title="Orders Served"
              value={stats.ordersCount}
              icon={Users}
              color="bg-blue-500"
              subtitle={`${stats.activeOrders} active`}
            />
            <StatCard
              title="Average Order"
              value={`KSh ${stats.averageOrderValue.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-purple-500"
            />
            <StatCard
              title="Customer Rating"
              value={stats.customerRating.toFixed(1)}
              icon={Star}
              color="bg-yellow-500"
              subtitle="Based on today's feedback"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/pos')}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <ShoppingCart className="w-8 h-8 text-yellow-500 mb-2" />
                <h3 className="font-medium text-slate-900">Take New Order</h3>
                <p className="text-sm text-slate-600">Open POS system to create orders</p>
              </button>
              
              <button
                onClick={() => navigate('/tables')}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-slate-900">View Tables</h3>
                <p className="text-sm text-slate-600">Check table status and assignments</p>
              </button>
              
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-left opacity-75">
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-medium text-slate-900">Performance Report</h3>
                <p className="text-sm text-slate-600">View detailed performance metrics</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
              <span className="text-sm text-slate-600">{recentOrders.length} orders</span>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{order.order_number}</p>
                      <p className="text-sm text-slate-600">
                        {order.table_number} • {order.items_count} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-slate-900">KSh {order.total.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">{getTimeElapsed(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            {recentOrders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Recent Orders</h3>
                <p className="text-slate-600">Start taking orders to see them here</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}