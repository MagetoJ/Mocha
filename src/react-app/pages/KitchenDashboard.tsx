import { useState, useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import { Clock, CheckCircle, AlertCircle, ChefHat, Timer } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  table_number?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  created_at: string;
  items: OrderItem[];
  waiter_name?: string;
  priority: 'low' | 'normal' | 'high';
}

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  special_instructions?: string;
  preparation_time: number;
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // This would be the actual API endpoint for kitchen orders
      const response = await fetch('/api/kitchen/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Mock data for demonstration
      setOrders([
        {
          id: 1,
          order_number: 'ORD-001',
          table_number: 'T-05',
          status: 'pending',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          waiter_name: 'Sarah Johnson',
          priority: 'normal',
          items: [
            {
              id: 1,
              menu_item_name: 'Grilled Salmon',
              quantity: 2,
              special_instructions: 'No onions',
              preparation_time: 25
            },
            {
              id: 2,
              menu_item_name: 'Caesar Salad',
              quantity: 1,
              preparation_time: 10
            }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-002',
          table_number: 'T-12',
          status: 'preparing',
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          waiter_name: 'Mike Davis',
          priority: 'high',
          items: [
            {
              id: 3,
              menu_item_name: 'Ribeye Steak',
              quantity: 1,
              special_instructions: 'Medium rare',
              preparation_time: 30
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      // For demo, update locally
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'normal': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return `${elapsed}m ago`;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return order.status !== 'completed';
    return order.status === filter;
  });

  return (
    <ProtectedRoute allowedRoles={['chef']} requiredPermission="kitchen">
      <Layout title="Kitchen Dashboard">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChefHat className="w-8 h-8 text-yellow-500" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Kitchen Dashboard</h1>
                  <p className="text-slate-600">Manage incoming orders and track preparation</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {filteredOrders.length}
                </div>
                <div className="text-sm text-slate-600">Active Orders</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex space-x-4">
              {[
                { key: 'all', label: 'All Active', count: orders.filter(o => o.status !== 'completed').length },
                { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { key: 'preparing', label: 'In Progress', count: orders.filter(o => o.status === 'preparing').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-yellow-500 text-black'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {order.order_number}
                      </h3>
                      {order.table_number && (
                        <p className="text-sm text-slate-600">
                          Table: {order.table_number}
                        </p>
                      )}
                      {order.waiter_name && (
                        <p className="text-sm text-slate-600">
                          Waiter: {order.waiter_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <AlertCircle className={`w-4 h-4 ${getPriorityColor(order.priority)}`} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-900">
                            {item.quantity}x {item.menu_item_name}
                          </span>
                          {item.special_instructions && (
                            <p className="text-sm text-slate-600 mt-1">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Timer className="w-4 h-4 mr-1" />
                          {item.preparation_time}m
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time and Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {getTimeElapsed(order.created_at)}
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Start Cooking
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Ready</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredOrders.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Orders</h3>
              <p className="text-slate-600">
                {filter === 'all' ? 'No active orders at the moment.' : `No ${filter} orders.`}
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}