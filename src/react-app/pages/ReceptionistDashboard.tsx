import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  UserPlus, 
  Calendar,
  MapPin,
  Phone,
  ShoppingCart,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import type { Table } from '@/shared/types';

interface ReceptionistStats {
  totalTables: number;
  occupiedTables: number;
  waitingGuests: number;
  todayCheckIns: number;
  averageWaitTime: number;
}

interface Reservation {
  id: number;
  guest_name: string;
  guest_phone?: string;
  party_size: number;
  reservation_time: string;
  status: 'confirmed' | 'seated' | 'cancelled' | 'no_show';
  table_number?: string;
  special_requests?: string;
}

interface WaitingGuest {
  id: number;
  guest_name: string;
  party_size: number;
  phone?: string;
  arrived_at: string;
  estimated_wait: number;
}

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReceptionistStats>({
    totalTables: 0,
    occupiedTables: 0,
    waitingGuests: 0,
    todayCheckIns: 0,
    averageWaitTime: 0
  });
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitingGuests, setWaitingGuests] = useState<WaitingGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; staff: any } | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showWaitingGuestModal, setShowWaitingGuestModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [reservationForm, setReservationForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    party_size: 1,
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '18:00',
    special_requests: ''
  });
  const [waitingGuestForm, setWaitingGuestForm] = useState({
    guest_name: '',
    guest_phone: '',
    party_size: 1,
    estimated_wait_minutes: 15,
    notes: ''
  });
  const [checkinForm, setCheckinForm] = useState({
    table_id: '',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('mariaHavens_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    fetchReceptionData();
  }, []);

  const fetchReceptionData = async () => {
    try {
      // Fetch tables
      const tablesResponse = await fetch('/api/tables');
      if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        setTables(tablesData);
        
        const totalTables = tablesData.length;
        const occupiedTables = tablesData.filter((t: Table) => t.is_occupied === 1).length;
        
        setStats(prev => ({
          ...prev,
          totalTables,
          occupiedTables
        }));
      }

      // Fetch other reception data
      const dashboardResponse = await fetch('/api/receptionist/dashboard');
      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setStats(prev => ({ ...prev, ...data.stats }));
        setReservations(data.reservations || []);
        setWaitingGuests(data.waitingGuests || []);
      }
    } catch (error) {
      console.error('Failed to fetch reception data:', error);
      // Mock data for demonstration
      setStats({
        totalTables: 20,
        occupiedTables: 12,
        waitingGuests: 3,
        todayCheckIns: 45,
        averageWaitTime: 15
      });
      
      setReservations([
        {
          id: 1,
          guest_name: 'John Smith',
          guest_phone: '+254712345678',
          party_size: 4,
          reservation_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          special_requests: 'Window seat preferred'
        },
        {
          id: 2,
          guest_name: 'Mary Johnson',
          party_size: 2,
          reservation_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          status: 'confirmed',
          table_number: 'T-08'
        }
      ]);
      
      setWaitingGuests([
        {
          id: 1,
          guest_name: 'David Wilson',
          party_size: 3,
          phone: '+254798765432',
          arrived_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          estimated_wait: 15
        },
        {
          id: 2,
          guest_name: 'Lisa Brown',
          party_size: 2,
          arrived_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          estimated_wait: 10
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const response = await fetch('/api/receptionist/available-tables');
      if (response.ok) {
        const tables = await response.json();
        setAvailableTables(tables);
      }
    } catch (error) {
      console.error('Failed to fetch available tables:', error);
    }
  };

  const addReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/receptionist/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationForm)
      });

      if (response.ok) {
        setShowReservationModal(false);
        setReservationForm({
          guest_name: '',
          guest_phone: '',
          guest_email: '',
          party_size: 1,
          reservation_date: new Date().toISOString().split('T')[0],
          reservation_time: '18:00',
          special_requests: ''
        });
        fetchReceptionData();
      }
    } catch (error) {
      console.error('Failed to add reservation:', error);
    }
  };

  const addWaitingGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/receptionist/waiting-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitingGuestForm)
      });

      if (response.ok) {
        setShowWaitingGuestModal(false);
        setWaitingGuestForm({
          guest_name: '',
          guest_phone: '',
          party_size: 1,
          estimated_wait_minutes: 15,
          notes: ''
        });
        fetchReceptionData();
      }
    } catch (error) {
      console.error('Failed to add waiting guest:', error);
    }
  };

  const checkinGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    
    try {
      const response = await fetch('/api/receptionist/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: selectedReservation.guest_name,
          party_size: selectedReservation.party_size,
          table_id: checkinForm.table_id,
          reservation_id: selectedReservation.id,
          notes: checkinForm.notes
        })
      });

      if (response.ok) {
        setShowCheckinModal(false);
        setSelectedReservation(null);
        setCheckinForm({ table_id: '', notes: '' });
        fetchReceptionData();
      }
    } catch (error) {
      console.error('Failed to check in guest:', error);
    }
  };

  const seatGuest = async (guestId: number, tableNumber: string) => {
    try {
      const response = await fetch(`/api/receptionist/seat-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, tableNumber })
      });

      if (response.ok) {
        // Remove from waiting list and update table status
        setWaitingGuests(prev => prev.filter(g => g.id !== guestId));
        fetchReceptionData();
      }
    } catch (error) {
      console.error('Failed to seat guest:', error);
      // For demo, update locally
      setWaitingGuests(prev => prev.filter(g => g.id !== guestId));
    }
  };

  const openCheckinModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCheckinModal(true);
    fetchAvailableTables();
  };

  const getWaitTime = (arrivedAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(arrivedAt).getTime()) / 60000);
    return `${elapsed}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <ProtectedRoute allowedRoles={['receptionist']} requiredPermission="manage_tables">
        <Layout title="Reception Dashboard">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['receptionist']} requiredPermission="manage_tables">
      <Layout title="Reception Dashboard">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome, {user?.staff?.first_name}!
                </h1>
                <p className="text-slate-600">Managing guest experience and table assignments</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/tables')}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Manage Tables</span>
                </button>
                <button
                  onClick={() => navigate('/pos')}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>POS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Available Tables"
              value={stats.totalTables - stats.occupiedTables}
              icon={MapPin}
              color="bg-green-500"
              subtitle={`${stats.totalTables} total tables`}
            />
            <StatCard
              title="Occupied Tables"
              value={stats.occupiedTables}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Waiting Guests"
              value={stats.waitingGuests}
              icon={Clock}
              color="bg-orange-500"
            />
            <StatCard
              title="Today's Check-ins"
              value={stats.todayCheckIns}
              icon={CheckCircle}
              color="bg-purple-500"
            />
            <StatCard
              title="Avg. Wait Time"
              value={`${stats.averageWaitTime}m`}
              icon={AlertCircle}
              color="bg-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waiting Guests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Waiting Guests</h2>
                <button 
                  onClick={() => setShowWaitingGuestModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium py-1 px-3 rounded-lg transition-colors text-sm flex items-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Guest</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {waitingGuests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{guest.guest_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{guest.party_size} guests</span>
                        <span>Waited: {getWaitTime(guest.arrived_at)}</span>
                        {guest.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {guest.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        ~{guest.estimated_wait}m
                      </span>
                      <button
                        onClick={() => {/* Implement seat guest logic */}}
                        className="bg-green-500 hover:bg-green-400 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                      >
                        Seat
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {waitingGuests.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Waiting Guests</h3>
                  <p className="text-slate-600">All guests have been seated</p>
                </div>
              )}
            </div>

            {/* Upcoming Reservations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming Reservations</h2>
                <button 
                  onClick={() => setShowReservationModal(true)}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-1 px-3 rounded-lg transition-colors text-sm flex items-center space-x-1"
                >
                  <Calendar className="w-4 h-4" />
                  <span>New Reservation</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {reservations.map(reservation => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{reservation.guest_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{reservation.party_size} guests</span>
                        <span>{formatTime(reservation.reservation_time)}</span>
                        {reservation.table_number && (
                          <span>Table: {reservation.table_number}</span>
                        )}
                      </div>
                      {reservation.special_requests && (
                        <p className="text-xs text-slate-500 mt-1">
                          Note: {reservation.special_requests}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {reservation.status === 'confirmed' && (
                        <button 
                          onClick={() => openCheckinModal(reservation)}
                          className="bg-green-500 hover:bg-green-400 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {reservations.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Reservations</h3>
                  <p className="text-slate-600">No upcoming reservations today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Reservation Modal */}
        {showReservationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">New Reservation</h3>
                <button 
                  onClick={() => setShowReservationModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={addReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reservationForm.guest_name}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, guest_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={reservationForm.guest_phone}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, guest_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Party Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={reservationForm.party_size}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, party_size: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={reservationForm.guest_email}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, guest_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={reservationForm.reservation_date}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, reservation_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={reservationForm.reservation_time}
                      onChange={(e) => setReservationForm(prev => ({ ...prev, reservation_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={reservationForm.special_requests}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, special_requests: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    Add Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Waiting Guest Modal */}
        {showWaitingGuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Add Waiting Guest</h3>
                <button 
                  onClick={() => setShowWaitingGuestModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={addWaitingGuest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={waitingGuestForm.guest_name}
                    onChange={(e) => setWaitingGuestForm(prev => ({ ...prev, guest_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={waitingGuestForm.guest_phone}
                      onChange={(e) => setWaitingGuestForm(prev => ({ ...prev, guest_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Party Size *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={waitingGuestForm.party_size}
                      onChange={(e) => setWaitingGuestForm(prev => ({ ...prev, party_size: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated Wait (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={waitingGuestForm.estimated_wait_minutes}
                    onChange={(e) => setWaitingGuestForm(prev => ({ ...prev, estimated_wait_minutes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={waitingGuestForm.notes}
                    onChange={(e) => setWaitingGuestForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWaitingGuestModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors font-medium"
                  >
                    Add to Waiting List
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Check In Guest Modal */}
        {showCheckinModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Check In Guest</h3>
                <button 
                  onClick={() => setShowCheckinModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-slate-900">{selectedReservation.guest_name}</h4>
                <p className="text-sm text-slate-600">
                  {selectedReservation.party_size} guests • {formatTime(selectedReservation.reservation_time)}
                </p>
                {selectedReservation.special_requests && (
                  <p className="text-xs text-slate-500 mt-1">
                    Note: {selectedReservation.special_requests}
                  </p>
                )}
              </div>
              
              <form onSubmit={checkinGuest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Table *
                  </label>
                  <select
                    required
                    value={checkinForm.table_id}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, table_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose a table...</option>
                    {availableTables.map(table => (
                      <option key={table.id} value={table.id}>
                        Table {table.table_number} {table.room_name && `(${table.room_name})`} - {table.capacity} seats
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={checkinForm.notes}
                    onChange={(e) => setCheckinForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCheckinModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    Check In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}