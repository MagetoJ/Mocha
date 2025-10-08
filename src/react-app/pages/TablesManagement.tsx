import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import TableForm from '@/react-app/components/TableForm';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  UtensilsCrossed,
  Users,
  MapPin,
  QrCode
} from 'lucide-react';
import type { Staff, Table } from '@/shared/types';

export default function TablesManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; staff: Staff } | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

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
      fetchTables();
    }
  }, [user]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTableStatus = async (tableId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_occupied: !currentStatus }),
      });

      if (response.ok) {
        await fetchTables();
      }
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };

  const rooms = Array.from(new Set(tables.map(table => table.room_name).filter(Boolean)));
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.room_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = selectedRoom === '' || table.room_name === selectedRoom;
    return matchesSearch && matchesRoom;
  });

  const getTablesByRoom = () => {
    const grouped: { [key: string]: Table[] } = {};
    filteredTables.forEach(table => {
      const room = table.room_name || 'Main Area';
      if (!grouped[room]) grouped[room] = [];
      grouped[room].push(table);
    });
    return grouped;
  };

  const tablesByRoom = getTablesByRoom();

  if (loading) {
    return (
      <Layout title="Tables & Rooms">
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
    <Layout title="Tables & Rooms">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tables & Rooms</h2>
            <p className="text-slate-600">Manage your restaurant seating and room layout</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tables or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">All Rooms</option>
            {rooms.map(room => (
              <option key={room} value={room || ''}>{room}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <UtensilsCrossed className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Tables</p>
                <p className="text-2xl font-bold text-slate-900">{tables.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Occupied</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tables.filter(t => t.is_occupied).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Available</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tables.filter(t => !t.is_occupied).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Seats</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tables.reduce((sum, table) => sum + table.capacity, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables by Room */}
        <div className="space-y-6">
          {Object.entries(tablesByRoom).map(([roomName, roomTables]) => (
            <div key={roomName} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-slate-500" />
                  {roomName}
                </h3>
                <span className="text-sm text-slate-500">
                  {roomTables.length} table{roomTables.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roomTables.map(table => (
                  <div 
                    key={table.id} 
                    className={`rounded-lg p-4 border-2 transition-colors ${
                      table.is_occupied 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">
                        Table {table.table_number}
                      </h4>
                      <div className="flex space-x-1">
                        <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-600 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Capacity:</span>
                        <span className="flex items-center text-slate-900">
                          <Users className="w-4 h-4 mr-1" />
                          {table.capacity}
                        </span>
                      </div>
                      
                      {table.qr_code_url && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">QR Code:</span>
                          <QrCode className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        table.is_occupied
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {table.is_occupied ? 'Occupied' : 'Available'}
                      </span>
                      
                      <button
                        onClick={() => toggleTableStatus(table.id, table.is_occupied === 1)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          table.is_occupied
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {table.is_occupied ? 'Free Up' : 'Mark Busy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tables found</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding your first table.'}
            </p>
          </div>
        )}

        {/* Add Table Form Modal */}
        {showForm && (
          <TableForm
            onClose={() => setShowForm(false)}
            onSuccess={fetchTables}
          />
        )}
      </div>
    </Layout>
  );
}
