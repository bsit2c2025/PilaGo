import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { QueueNumberBadge, StatusBadge } from '../components/common/StatusBadge';
import FareBreakdownCard from '../components/common/FareBreakdownCard';
import TripTicketModal from '../components/common/TripTicketModal';
import { MapPin, Users, Bike, QrCode, AlertCircle, RefreshCw } from 'lucide-react';

export default function PassengerPortal() {
  const { user } = useAuth();
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [tripType, setTripType] = useState('REGULAR');
  const [partySize, setPartySize] = useState(1);

  const [farePreview, setFarePreview] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Load terminals and check active queue
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Poll active queue status every 4 seconds for instant updates
  useEffect(() => {
    if (!activeQueue) return;
    const interval = setInterval(fetchQueueStatus, 4000);
    return () => clearInterval(interval);
  }, [activeQueue?.id, activeQueue?.status]);

  const fetchInitialData = async () => {
    try {
      const [termRes, statusRes] = await Promise.all([
        api.get('/terminals/'),
        api.get('/queue/my-status/'),
      ]);
      setTerminals(termRes.data);
      if (termRes.data.length > 0) {
        setSelectedTerminal(termRes.data[0].id);
        setDestinations(termRes.data[0].destinations || []);
        if (termRes.data[0].destinations?.length > 0) {
          setSelectedDestination(termRes.data[0].destinations[0].id);
        }
      }
      if (statusRes.data.has_active_queue) {
        setActiveQueue(statusRes.data.entry);
      }
    } catch (e) {
      console.error('Failed to load initial data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const res = await api.get('/queue/my-status/');
      if (res.data.has_active_queue) {
        setActiveQueue(res.data.entry);
      } else {
        setActiveQueue(null);
      }
    } catch (e) {
      console.error('Failed to refresh queue status', e);
    }
  };

  // Recalculate fare preview when destination or trip type changes
  useEffect(() => {
    if (!selectedDestination) return;
    api
      .post('/fare/calculate/', {
        destination_id: selectedDestination,
        trip_type: tripType,
      })
      .then((res) => setFarePreview(res.data))
      .catch((err) => console.error(err));
  }, [selectedDestination, tripType]);

  const handleTerminalChange = (termId) => {
    setSelectedTerminal(termId);
    const found = terminals.find((t) => t.id === Number(termId));
    if (found) {
      setDestinations(found.destinations || []);
      if (found.destinations?.length > 0) {
        setSelectedDestination(found.destinations[0].id);
      }
    }
  };

  const handleJoinQueue = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/queue/join/', {
        terminal_id: selectedTerminal,
        destination_id: selectedDestination,
        trip_type: tripType,
        party_size: partySize,
      });
      setActiveQueue(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelQueue = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue spot?')) return;
    try {
      await api.post(`/queue/${activeQueue.id}/cancel/`);
      setActiveQueue(null);
    } catch (err) {
      alert('Failed to cancel queue.');
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
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* ACTIVE QUEUE SCREEN */}
      {activeQueue ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Terminal: {activeQueue.terminal_name}</span>
              <StatusBadge status={activeQueue.status} />
            </div>

            <div className="py-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Your Official Queue Number
              </span>
              <div className="inline-flex items-center justify-center font-extrabold text-5xl sm:text-6xl tabular-nums tracking-tight px-6 py-3 rounded-2xl bg-brand-50 text-brand-900 border border-brand-200 shadow-sm">
                {activeQueue.queue_number}
              </div>
            </div>

            {/* Position info */}
            {activeQueue.status === 'WAITING' && (
              <div className="bg-brand-50/60 rounded-xl p-3 border border-brand-100 flex items-center justify-center space-x-2 text-brand-900 text-sm font-semibold">
                <Users className="w-4 h-4 text-brand-600" />
                <span>
                  {activeQueue.people_ahead === 0
                    ? 'You are next in line! Preparing tricycle...'
                    : `${activeQueue.people_ahead} passenger(s) ahead of you in line.`}
                </span>
              </div>
            )}

            {/* Assigned Tricycle Display (When Called) */}
            {activeQueue.assigned_tricycle && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-left space-y-1">
                <div className="flex items-center justify-between text-amber-900 font-bold text-sm">
                  <span className="flex items-center">
                    <Bike className="w-4 h-4 mr-1 text-gold-700" />
                    Board Tricycle #{activeQueue.assigned_tricycle.body_number}
                  </span>
                  <span className="text-xs bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                    Plate: {activeQueue.assigned_tricycle.plate_number}
                  </span>
                </div>
                <div className="text-xs text-amber-800">
                  Driver: <span className="font-semibold">{activeQueue.assigned_tricycle.driver_name}</span>
                </div>
                <div className="text-[11px] text-amber-700 font-medium pt-1">
                  Please proceed to Boarding Bay 1. Show your digital ticket pass to driver.
                </div>
              </div>
            )}

            {/* Destination & Official Fare Due */}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-600">
              <div>
                <span className="text-gray-400 block">Destination</span>
                <span className="font-bold text-gray-800 text-sm">{activeQueue.destination_name}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block">Fixed Fare</span>
                <span className="font-extrabold text-brand-900 text-lg tabular-nums">
                  ₱{Number(activeQueue.computed_fare).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setTicketModalOpen(true)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center transition shadow-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                View Trip Pass / QR
              </button>
              {activeQueue.status === 'WAITING' && (
                <button
                  onClick={handleCancelQueue}
                  className="bg-white hover:bg-red-50 text-semantic-destructive border border-red-200 font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Leave Queue
                </button>
              )}
            </div>
          </div>

          <TripTicketModal
            isOpen={ticketModalOpen}
            onClose={() => setTicketModalOpen(false)}
            ticketData={activeQueue}
          />
        </div>
      ) : (
        /* JOIN QUEUE FORM */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900">Join Tricycle Queue</h2>
            <p className="text-xs text-gray-500 mt-1">
              Select your destination to preview the legal fare and claim your turn.
            </p>
          </div>

          <div className="space-y-4">
            {/* Terminal Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600" />
                Select Terminal
              </label>
              <select
                value={selectedTerminal}
                onChange={(e) => handleTerminalChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
              >
                {terminals.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.waiting_passengers_count} waiting, {t.available_drivers_count} drivers)
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Select Destination Zone / Landmark
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.distance_km} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Trip Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripType('REGULAR')}
                  className={`p-3 rounded-xl border text-left transition ${
                    tripType === 'REGULAR'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs text-brand-900">Regular (Shared)</div>
                  <div className="text-[11px] text-gray-500">₱20.00 base / pax</div>
                  <div className="text-[10px] text-brand-600 mt-1">Lines up for shared 4-seat ride</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTripType('SPECIAL')}
                  className={`p-3 rounded-xl border text-left transition ${
                    tripType === 'SPECIAL'
                      ? 'border-gold-500 bg-amber-50/50 ring-2 ring-amber-400'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-900">Special (Solo / Extra)</div>
                  <div className="text-[11px] text-gray-500">₱60.00 base total</div>
                  <div className="text-[10px] text-amber-700 mt-1">Direct private dispatch</div>
                </button>
              </div>
            </div>

            {/* Live Fare Breakdown Card */}
            <FareBreakdownCard
              fareData={farePreview}
              tripType={tripType}
              isDiscounted={user?.is_discount_verified && user?.discount_type !== 'NONE'}
            />

            {/* Submit Button */}
            <button
              onClick={handleJoinQueue}
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition"
            >
              {submitting ? 'Entering Queue...' : 'Confirm & Join Queue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
