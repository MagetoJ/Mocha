import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  BarChart3,
  Filter
} from 'lucide-react';
import type { Staff } from '@/shared/types';

export default function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

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
      // Simulate data loading
      setTimeout(() => setLoading(false), 1000);
    }
  }, [user]);

  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    topItems: [],
    stats: [
      {
        name: 'Total Revenue',
        value: 'KSh 0',
        change: '+0%',
        changeType: 'neutral',
        icon: DollarSign,
      },
      {
        name: 'Orders Processed',
        value: '0',
        change: '+0%',
        changeType: 'neutral',
        icon: ShoppingCart,
      },
      {
        name: 'Average Order Value',
        value: 'KSh 0',
        change: '+0%',
        changeType: 'neutral',
        icon: TrendingUp,
      },
      {
        name: 'Active Tables',
        value: '0',
        change: '+0',
        changeType: 'neutral',
        icon: Users,
      },
    ]
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      // For now, we'll use basic data from existing tables
      const tablesRes = await fetch('/api/tables');

      let stats = analyticsData.stats;
      
      if (tablesRes.ok) {
        const tables = await tablesRes.json();
        const activeTables = tables.filter((t: any) => t.is_occupied).length;
        stats = stats.map(stat => 
          stat.name === 'Active Tables' 
            ? { ...stat, value: activeTables.toString() }
            : stat
        );
      }

      setAnalyticsData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.staff) {
    return null;
  }

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Analytics Dashboard</h2>
            <p className="text-slate-600">Track your restaurant's performance and insights</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-semibold">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {analyticsData.stats.map((stat) => (
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
                <span className={`text-sm font-medium flex items-center ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Weekly Revenue</h3>
              <BarChart3 className="w-5 h-5 text-slate-500" />
            </div>
            
            <div className="space-y-4">
              {analyticsData.salesData.length > 0 ? analyticsData.salesData.map((day: any) => (
                <div key={day.name} className="flex items-center">
                  <div className="w-12 text-sm text-slate-600">{day.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(day.revenue / 45000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    KSh {day.revenue.toLocaleString()}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No sales data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Menu Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Top Menu Items</h3>
              <TrendingUp className="w-5 h-5 text-slate-500" />
            </div>
            
            <div className="space-y-4">
              {analyticsData.topItems.length > 0 ? analyticsData.topItems.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-yellow-800">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.sales} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">KSh {item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No menu item data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Large order completed</p>
                <p className="text-sm text-slate-500">Table 12 - KSh 2,450 • 5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Peak hour traffic</p>
                <p className="text-sm text-slate-500">18 tables occupied • 12 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Daily target achieved</p>
                <p className="text-sm text-slate-500">105% of daily revenue goal • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
