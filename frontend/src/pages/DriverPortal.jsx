import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bike, Users, Send, CheckCircle2, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';

export default function DriverPortal() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDriverState();
    const interval = setInterval(fetchDriverState, 3500);
    return () => clearInterval(interval);
  }, []);

  const fetchDriverState = async () => {
    try {
      const [profRes, assignRes] = await Promise.all([
        api.get('/driver/profile/'),
        api.get('/driver/current-assignment/'),
      ]);
      setProfile(profRes.data);
      setAssignment(assignRes.data);
    } catch (e) {
      console.error('Failed to load driver state', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch('/driver/status/', { status: newStatus });
      setProfile(res.data);
      await fetchDriverState();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/driver/check-in/', { terminal_id: profile?.terminal || 1 });
      setProfile(res.data.profile);
      await fetchDriverState();
    } catch (e) {
      alert('Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualDispatch = async () => {
    if (!window.confirm('Dispatch now with currently boarded passengers?')) return;
    setActionLoading(true);
    try {
      await api.post('/driver/dispatch-override/');
      await fetchDriverState();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to dispatch.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async (dispatchId) => {
    setActionLoading(true);
    try {
      await api.post(`/driver/dispatch/${dispatchId}/complete/`, { re_enter_queue: true });
      await fetchDriverState();
    } catch (e) {
      alert('Failed to complete trip');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Driver Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-subtle flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-900 text-gold-500 flex items-center justify-center font-extrabold text-xl shadow-sm">
            #{profile?.body_number || '00'}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-brand-900">{profile?.driver_name}</h2>
            <div className="text-xs text-gray-500">
              Terminal: <span className="font-semibold text-gray-700">{profile?.terminal_name || 'Bayan Central'}</span>
            </div>
            <div className="text-[11px] text-gray-400">Plate: {profile?.plate_number}</div>
          </div>
        </div>

        <StatusBadge status={profile?.status} />
      </div>

      {/* Queue Status or Active Assignment */}
      {assignment?.has_assignment ? (
        /* ACTIVE DISPATCH PANEL */
        <div className="bg-white rounded-2xl border-2 border-brand-600 p-6 shadow-md space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {assignment.trip_type === 'SPECIAL' ? 'Special Solo Trip' : 'Regular Shared Dispatch'}
              </span>
              <h3 className="text-xl font-extrabold text-brand-900 mt-1.5">Boarding Bay 1</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Total Fare Revenue</span>
              <span className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                ₱{assignment.total_fare?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Passenger Boarding List */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Boarded Passengers ({assignment.passengers?.length})
            </span>
            {assignment.passengers?.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="font-extrabold text-brand-900 mr-2 tabular-nums">[{p.queue_number}]</span>
                  <span className="font-semibold text-gray-800">{p.passenger_name}</span>
                  <div className="text-gray-500 text-[11px] mt-0.5">{p.destination} ({p.distance_km} km)</div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-brand-900 tabular-nums">₱{p.computed_fare?.toFixed(2)}</span>
                  {p.is_discounted && (
                    <span className="block text-[10px] text-amber-700 font-bold">20% Discount</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action: Complete Trip */}
          <button
            onClick={() => handleCompleteTrip(assignment.dispatch_id)}
            disabled={actionLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow transition flex items-center justify-center"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Cash Paid & Complete Trip (Re-enter FIFO Queue)
          </button>
        </div>
      ) : (
        /* FIFO QUEUE WAITING CARD */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle text-center space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Terminal FIFO Queue Status
          </span>

          {profile?.status === 'QUEUED' ? (
            <div className="space-y-3">
              <div className="inline-flex flex-col items-center justify-center p-6 bg-brand-50 rounded-2xl border border-brand-200 min-w-[220px]">
                <span className="text-xs text-brand-700 font-bold uppercase tracking-wider">Your Position</span>
                <span className="text-5xl font-extrabold text-brand-900 tabular-nums my-1">
                  #{profile.queue_position || 1}
                </span>
                <span className="text-xs text-brand-600 font-medium">in Terminal Line</span>
              </div>

              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {profile.queue_position === 1
                  ? 'You are at the head of the queue! You will receive the next passenger batch or special trip.'
                  : 'Wait for preceding tricycles to be dispatched. System preserves strict FIFO order.'}
              </p>

              {/* Driver Manual Override Dispatch */}
              {profile.queue_position === 1 && (
                <div className="pt-2">
                  <button
                    onClick={handleManualDispatch}
                    disabled={actionLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Dispatch Now (Manual Departure Override)
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Depart with currently queued passengers without waiting for full capacity.
                  </p>
                </div>
              )}

              {/* Pause Queue Button */}
              <div className="pt-3 border-t border-gray-100 flex justify-center space-x-3">
                <button
                  onClick={() => handleStatusChange('PAUSED')}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center p-2 rounded-lg hover:bg-gray-100"
                >
                  <PauseCircle className="w-4 h-4 mr-1 text-gray-500" />
                  Take a Break (Pause Queue)
                </button>
                <button
                  onClick={() => handleStatusChange('OFFLINE')}
                  className="text-xs font-bold text-semantic-destructive hover:bg-red-50 p-2 rounded-lg"
                >
                  Check Out (Offline)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                You are currently <span className="font-bold text-gray-900">{profile?.status}</span>.
                Check in at the terminal to join the line.
              </p>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow transition flex items-center justify-center"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Check In to Terminal FIFO Queue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
