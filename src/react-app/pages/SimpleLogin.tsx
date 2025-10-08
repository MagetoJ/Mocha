import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function SimpleLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('mariaHavens_user', JSON.stringify(data.user));
        
        // Redirect based on user role
        const userRole = data.user.staff.role;
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'manager':
            navigate('/dashboard');
            break;
          case 'waiter':
            navigate('/waiter-dashboard');
            break;
          case 'receptionist':
            navigate('/reception-dashboard');
            break;
          case 'chef':
            navigate('/kitchen');
            break;
          default:
            navigate('/pos');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (error) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4 backdrop-blur-sm border border-yellow-500/30">
              <img 
                src="https://mocha-cdn.com/0199c326-ff38-7723-a41d-ac28fbe57801/IMG-20250929-WA0097.jpg" 
                alt="Maria Havens" 
                className="w-12 h-12 object-contain rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Maria Havens</h1>
            <p className="text-slate-300">Premium restaurant management system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Staff Login</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the system</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:from-slate-600 disabled:to-slate-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

