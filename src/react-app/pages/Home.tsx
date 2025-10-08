import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = localStorage.getItem('mariaHavens_user');
    if (localUser) {
      navigate('/pos');
    } else {
      navigate('/pos');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="animate-spin">
        <Loader2 className="w-10 h-10 text-slate-400" />
      </div>
    </div>
  );
}
