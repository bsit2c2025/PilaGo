import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ShieldCheck, AlertCircle, MapPin, Bike, Users, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export default function TicketVerification() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [token]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/trips/ticket/${token}/`);
      setTicket(res.data);
    } catch (err) {
      setError('Invalid or expired ticket token. Please verify with terminal dispatcher.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Verification Failed</h2>
        <p className="text-xs text-gray-600">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 pt-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Return to PilaGo Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Official Verified Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Verification Ribbon */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-white" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">PilaGo Municipal Pass</div>
              <div className="text-[11px] text-emerald-100 font-medium">Valid & Authenticated</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full">
            {ticket.queue_number}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Queue & Status */}
          <div className="text-center space-y-2 pb-4 border-b border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trip Queue Number</div>
            <div className="text-5xl font-black text-brand-900 tabular-nums">
              {ticket.queue_number}
            </div>
            <div>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Passenger & Trip Details */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Passenger Name</span>
              <span className="font-bold text-gray-900">{ticket.passenger_name}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Terminal Origin</span>
              <span className="font-semibold text-gray-800">{ticket.terminal_name}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Destination</span>
              <span className="font-bold text-brand-900 text-sm text-right">{ticket.destination_name}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Distance Traveled</span>
              <span className="font-semibold text-gray-800">{ticket.distance_km} km</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Trip Category</span>
              <span className="font-semibold text-gray-800">
                {ticket.trip_type === 'SPECIAL' ? 'Special Solo Trip' : 'Regular Shared Trip'}
              </span>
            </div>

            {ticket.is_discounted && (
              <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900">Statutory Discount</span>
                <span className="font-bold text-amber-800">20% Applied</span>
              </div>
            )}
          </div>

          {/* Assigned Tricycle if assigned */}
          {ticket.assigned_driver && (
            <div className="bg-brand-50/70 p-4 rounded-2xl border border-brand-100 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-brand-900 flex items-center">
                  <Bike className="w-4 h-4 mr-1 text-gold-600" /> Assigned Tricycle
                </span>
                <span className="text-xs font-black bg-brand-900 text-white px-2.5 py-0.5 rounded-full">
                  Body #{ticket.assigned_driver.body_number}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Driver: <span className="font-semibold text-gray-900">{ticket.assigned_driver.driver_name}</span>
              </div>
              <div className="text-[11px] text-gray-500">Plate: {ticket.assigned_driver.plate_number}</div>
            </div>
          )}

          {/* Official Fare Due */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Official Fare to Pay Driver
            </span>
            <div className="text-4xl font-black text-emerald-900 tabular-nums">
              ₱{Number(ticket.computed_fare).toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium block">
              Cash payment upon arrival · No additional fees allowed
            </span>
          </div>

          {/* Token info */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-gray-400 font-mono">
              Ticket Token: {ticket.ticket_token}
            </p>
            <p className="text-[11px] text-gray-500 mt-2">
              Protected by Local Municipal Tricycle Regulatory Board.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
