import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { hasPermission, type StaffRole } from '../../shared/types';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  allowedRoles?: StaffRole[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission, 
  allowedRoles,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('mariaHavens_user');
    
    if (!storedUser) {
      navigate(fallbackPath);
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Check permissions
    if (!userData?.staff?.role) {
      navigate(fallbackPath);
      return;
    }

    const userRole = userData.staff.role as StaffRole;
    let hasPermissionAccess = true;
    let hasRoleAccess = true;

    // Check permission-based access
    if (requiredPermission) {
      hasPermissionAccess = hasPermission(userRole, requiredPermission);
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      hasRoleAccess = allowedRoles.includes(userRole);
    }

    const access = hasPermissionAccess && hasRoleAccess;
    setHasAccess(access);

    if (!access) {
      // Redirect to appropriate dashboard based on role
      navigate(getRoleDashboard(userRole));
      return;
    }

    setLoading(false);
  }, [navigate, requiredPermission, allowedRoles, fallbackPath]);

  const getRoleDashboard = (role: StaffRole): string => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'manager':
        return '/dashboard';
      case 'waiter':
        return '/pos';
      case 'receptionist':
        return '/reception-dashboard';
      case 'chef':
        return '/kitchen';
      default:
        return '/pos';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate(getRoleDashboard(user?.staff?.role))}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

