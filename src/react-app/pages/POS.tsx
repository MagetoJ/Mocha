import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import {
  Search,
  ShoppingCart,
  Trash2,
  CreditCard,
  DollarSign,
  Clock,
  X,
  LogIn,
  User,
  LogOut,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react';
import type { Staff, MenuItem, MenuCategory, Table } from '@/shared/types';

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export default function POS() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [waiters, setWaiters] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWaiterPinModal, setShowWaiterPinModal] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<Staff | null>(null);
  const [waiterPin, setWaiterPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, itemsRes, tablesRes, waitersRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items'),
        fetch('/api/tables'),
        fetch('/api/staff?role=waiter')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      }

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setMenuItems(itemsData);
      }

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        setTables(tablesData);
      }

      if (waitersRes.ok) {
        const waitersData = await waitersRes.json();
        setWaiters(waitersData.filter((staff: Staff) => staff.is_active === 1));
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginCredentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('mariaHavens_user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLogin(false);
        setLoginCredentials({ email: '', password: '' });
        
        // Redirect based on user role if not waiter
        const userRole = data.user.staff.role;
        if (userRole !== 'waiter') {
          switch (userRole) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'manager':
              navigate('/dashboard');
              break;
            case 'receptionist':
              navigate('/reception-dashboard');
              break;
            case 'chef':
              navigate('/kitchen');
              break;
            default:
              break;
          }
        }
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('A network error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mariaHavens_user');
    setUser(null);
    setCart([]);
    setSelectedTable(null);
    setSelectedWaiter(null);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
    setSelectedWaiter(null);
  };

  const handleCheckout = () => {
    if (user?.staff.role === 'waiter') {
      // If logged in user is waiter, use them directly
      setSelectedWaiter(user.staff);
      setShowWaiterPinModal(true);
    } else {
      // If admin/manager, show waiter selection first
      setShowCheckout(true);
    }
  };

  const handleWaiterSelection = (waiter: Staff) => {
    setSelectedWaiter(waiter);
    setShowCheckout(false);
    setShowWaiterPinModal(true);
  };

  const handlePinSubmit = async () => {
    if (!selectedWaiter || !waiterPin) {
      setPinError('Please enter your PIN');
      return;
    }

    try {
      // Verify PIN against the waiter's password (in a real app, you'd have separate PIN field)
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waiterId: selectedWaiter.id,
          pin: waiterPin
        }),
      });

      if (response.ok) {
        // Submit the order
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            waiter_id: selectedWaiter.id,
            table_id: selectedTable?.id,
            items: cart.map(item => ({
              menu_item_id: item.id,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes
            })),
            total_amount: calculateTotal()
          }),
        });

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          
          // Generate receipt data
          const receipt = {
            orderId: orderData.id,
            orderNumber: `#MH${String(orderData.id).padStart(4, '0')}`,
            waiter: `${selectedWaiter.first_name} ${selectedWaiter.last_name}`,
            table: selectedTable ? `${selectedTable.room_name ? selectedTable.room_name + ' - ' : ''}Table ${selectedTable.table_number}` : 'Takeout',
            items: cart,
            total: calculateTotal(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            logo: "https://mocha-cdn.com/0199c326-ff38-7723-a41d-ac28fbe57801/IMG-20250929-WA0097.jpg"
          };

          setReceiptData(receipt);
          setShowReceipt(true);
          setShowWaiterPinModal(false);
          clearCart();
          setWaiterPin('');
          setPinError('');
        } else {
          setPinError('Failed to submit order. Please try again.');
        }
      } else {
        setPinError('Invalid PIN. Please try again.');
      }
    } catch (error) {
      setPinError('Error processing order. Please try again.');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Layout title="Maria Havens POS">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Maria Havens POS">
      {/* Header with Login/User info */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img 
            src="https://mocha-cdn.com/0199c326-ff38-7723-a41d-ac28fbe57801/IMG-20250929-WA0097.jpg" 
            alt="Maria Havens" 
            className="w-12 h-12 object-contain rounded-full border border-slate-200"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Maria Havens</h1>
            <p className="text-slate-600">Point of Sale System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user.staff.first_name} {user.staff.last_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user.staff.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Staff Login</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Menu */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!user || (user && user.staff.role === 'waiter') ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => user && addToCart(item)}
                    disabled={!user}
                    className={`text-left bg-slate-50 rounded-lg p-4 border border-slate-200 transition-colors ${
                      user 
                        ? 'hover:bg-yellow-50 hover:border-yellow-200 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="aspect-square bg-slate-200 rounded-lg mb-3 flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-slate-400">
                          <DollarSign className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">KSh {item.price.toFixed(2)}</span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.preparation_time}m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Access Restricted</h3>
                  <p className="text-slate-500 mb-4">Only waiters can place orders through this system.</p>
                  <p className="text-sm text-slate-400">Contact a waiter or log in with waiter credentials to continue.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Current Order
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table Selection */}
          <div className="p-4 border-b border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Table
            </label>
            <select
              value={selectedTable?.id || ''}
              onChange={(e) => {
                const table = tables.find(t => t.id === Number(e.target.value));
                setSelectedTable(table || null);
              }}
              disabled={!user}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Choose a table</option>
              {tables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.room_name ? `${table.room_name} - ` : ''}Table {table.table_number}
                  {table.is_occupied ? ' (Occupied)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 p-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No items in cart</p>
                <p className="text-slate-400 text-sm">
                  {user ? 'Add items from the menu' : 'Login as waiter to start ordering'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-slate-900">
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-slate-900">Total:</span>
                <span className="text-2xl font-bold text-slate-900">
                  KSh {calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={!selectedTable || !user}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-300 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Process Order
              </button>
              {!selectedTable && user && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Please select a table to continue
                </p>
              )}
              {!user && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Please login as waiter to continue
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
                <img 
                  src="https://mocha-cdn.com/0199c326-ff38-7723-a41d-ac28fbe57801/IMG-20250929-WA0097.jpg" 
                  alt="Maria Havens" 
                  className="w-12 h-12 object-contain rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Staff Login</h3>
              <p className="text-slate-600">Enter your credentials to access the system</p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginCredentials.email}
                  onChange={(e) => setLoginCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setLoginCredentials({ email: '', password: '' });
                    setLoginError('');
                  }}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-300 text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                >
                  {loginLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waiter Selection Modal (for non-waiter users) */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Select Waiter</h3>
              <p className="text-slate-600">Choose the waiter responsible for this order</p>
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {waiters.map(waiter => (
                <button
                  key={waiter.id}
                  onClick={() => handleWaiterSelection(waiter)}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                >
                  <div className="font-medium text-slate-900">
                    {waiter.first_name} {waiter.last_name}
                  </div>
                  <div className="text-sm text-slate-500">ID: {waiter.employee_id}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCheckout(false)}
              className="w-full px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      {showWaiterPinModal && selectedWaiter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Verify Identity</h3>
              <p className="text-slate-600">
                {selectedWaiter.first_name} {selectedWaiter.last_name}, please enter your PIN
              </p>
            </div>

            {pinError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
                {pinError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">PIN</label>
              <input
                type="password"
                value={waiterPin}
                onChange={(e) => {
                  setWaiterPin(e.target.value);
                  setPinError('');
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="Enter PIN"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWaiterPinModal(false);
                  setWaiterPin('');
                  setPinError('');
                  setSelectedWaiter(null);
                }}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Verify & Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Receipt Content */}
            <div className="p-6" id="receipt-content">
              <div className="text-center mb-6">
                <img 
                  src={receiptData.logo} 
                  alt="Maria Havens" 
                  className="w-16 h-16 object-contain mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-slate-900">Maria Havens</h2>
                <p className="text-slate-600">Premium Restaurant</p>
                <div className="border-t border-slate-200 mt-4 pt-4">
                  <p className="text-lg font-semibold">Order {receiptData.orderNumber}</p>
                  <p className="text-sm text-slate-500">{receiptData.date} at {receiptData.time}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Waiter:</span>
                  <span className="font-medium">{receiptData.waiter}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Table:</span>
                  <span className="font-medium">{receiptData.table}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {receiptData.items.map((item: CartItem, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        <div className="text-slate-500 text-xs">KSh {item.price.toFixed(2)} each</div>
                      </div>
                      <span className="font-medium">KSh {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>KSh {receiptData.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500">
                <p>Thank you for dining with us!</p>
                <p>Visit us again soon</p>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="p-4 border-t border-slate-200 flex space-x-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}