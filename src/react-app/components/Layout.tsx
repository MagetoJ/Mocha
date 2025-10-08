import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  UtensilsCrossed, 
  BarChart3, 
  ShoppingCart,
  LogOut,
  UserCircle
} from 'lucide-react';
import type { Staff } from '@/shared/types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mariaHavens_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mariaHavens_user');
    setUser(null);
    navigate('/login');
  };

  const navigation = [
    { name: 'POS System', href: '/pos', icon: ShoppingCart },
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Staff Management', href: '/staff', icon: Users },
    { name: 'Menu Management', href: '/menu', icon: UtensilsCrossed },
    { name: 'Tables & Rooms', href: '/tables', icon: UtensilsCrossed },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-slate-200">
            <img 
              src="https://mocha-cdn.com/0199c326-ff38-7723-a41d-ac28fbe57801/IMG-20250929-WA0097.jpg" 
              alt="Maria Havens" 
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-yellow-500 text-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User info and logout */}
          {user && (
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <UserCircle className="w-8 h-8 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.staff.first_name} {user.staff.last_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.staff.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-slate-900">{title}</h1>
            </div>
            
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile sidebar close button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 lg:hidden p-2 rounded-md bg-white shadow-lg text-slate-400 hover:text-slate-500"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
