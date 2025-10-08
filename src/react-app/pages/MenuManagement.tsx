import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import MenuForm from '@/react-app/components/MenuForm';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  UtensilsCrossed,
  Clock,
  Package,
  Tag
} from 'lucide-react';
import type { Staff, MenuCategory, MenuItem } from '@/shared/types';

export default function MenuManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<'category' | 'item' | null>(null);

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
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setMenuItems(itemsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Layout title="Menu Management">
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
    <Layout title="Menu Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Menu Management</h2>
            <p className="text-slate-600">Manage your restaurant menu items and categories</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm('category')}
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
            >
              <Tag className="w-4 h-4 mr-2" />
              Add Category
            </button>
            <button 
              onClick={() => setShowForm('item')}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(category => (
              <div key={category.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{category.name}</h4>
                  <div className="flex space-x-1">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-2">{category.description}</p>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {menuItems.filter(item => item.category_id === category.id).length} items
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Menu Items</h3>
            <span className="text-sm text-slate-500">{filteredItems.length} items</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="aspect-square bg-slate-200 rounded-lg mb-3 flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <UtensilsCrossed className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                  <div className="flex space-x-1">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Price</span>
                    <span className="font-bold text-slate-900">KSh {item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Prep Time</span>
                    <span className="text-xs text-slate-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.preparation_time}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Category</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                      {item.category_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No menu items found</h3>
              <p className="text-slate-600">
                {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding your first menu item.'}
              </p>
            </div>
          )}
        </div>

        {/* Add Form Modal */}
        {showForm && (
          <MenuForm
            type={showForm}
            categories={categories}
            onClose={() => setShowForm(null)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </Layout>
  );
}
