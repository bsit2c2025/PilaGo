import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Shield, MapPin, Bike, Users, Check, X, RefreshCw, Calculator, Camera } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import QRScannerModal from '../components/common/QRScannerModal';

export default function AdminPortal() {
  const [terminalCode, setTerminalCode] = useState('bayan-central');
  const [boardData, setBoardData] = useState(null);
  const [pendingDiscounts, setPendingDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Fare Simulator State
  const [simDist, setSimDist] = useState(3.5);
  const [simType, setSimType] = useState('REGULAR');
  const [simDiscount, setSimDiscount] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, [terminalCode]);

  const fetchAdminData = async () => {
    try {
      const [boardRes, discRes] = await Promise.all([
        api.get(`/public/board/${terminalCode}/`),
        api.get('/admin/discounts/pending/').catch(() => ({ data: [] })),
      ]);
      setBoardData(boardRes.data);
      setPendingDiscounts(discRes.data || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDiscount = async (userId, approved) => {
    try {
      await api.patch(`/admin/discounts/${userId}/verify/`, { approved });
      setPendingDiscounts(pendingDiscounts.filter((d) => d.id !== userId));
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleAdminScan = async (code) => {
    try {
      const res = await api.post('/driver/verify-ticket/', { ticket_token: code });
      setScanResult({
        success: true,
        data: res.data.passenger
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid ticket token');
    }
  };

  // Run simulation locally based on formula
  useEffect(() => {
    const d = Number(simDist);
    const extra = Math.max(0, d - 2.0);
    let base, rate;
    if (simType === 'REGULAR') {
      base = simDiscount ? 16.0 : 20.0;
      rate = simDiscount ? 4.0 : 5.0;
    } else {
      base = simDiscount ? 48.0 : 60.0;
      rate = simDiscount ? 12.0 : 15.0;
    }
    const charge = extra * rate;
    setSimResult({
      base,
      extra,
      rate,
      charge,
      total: base + charge,
    });
  }, [simDist, simType, simDiscount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-brand-900" />
            <h1 className="text-2xl font-extrabold text-brand-900">Terminal Dispatch & Operations</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Live queue oversight, FIFO driver roster, and fare compliance.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-gold-500" />
            <span>Scan Ticket QR</span>
          </button>

          <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
            <span className="text-xs font-semibold text-gray-500">Terminal:</span>
            <select
              value={terminalCode}
              onChange={(e) => setTerminalCode(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="bayan-central">Bayan Central Terminal</option>
              <option value="north-junction">North Highway Junction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-subtle">
          <span className="text-xs text-gray-500 font-semibold block">Waiting Regular</span>
          <span className="text-3xl font-extrabold text-brand-900 tabular-nums">
            {boardData?.waiting_regular_count || 0}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Shared trip queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-subtle">
          <span className="text-xs text-gray-500 font-semibold block">Waiting Special</span>
          <span className="text-3xl font-extrabold text-gold-700 tabular-nums">
            {boardData?.waiting_special_count || 0}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Solo/private requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-subtle">
          <span className="text-xs text-gray-500 font-semibold block">Active Queued Drivers</span>
          <span className="text-3xl font-extrabold text-brand-600 tabular-nums">
            {boardData?.available_drivers_count || 0}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">FIFO dispatch line</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-subtle">
          <span className="text-xs text-gray-500 font-semibold block">Currently Boarding</span>
          <span className="text-3xl font-extrabold text-emerald-700 tabular-nums">
            {boardData?.now_boarding?.length || 0}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">Tricycles at bays</span>
        </div>
      </div>

      {/* Dual Queue Monitoring: Passenger Line & Driver FIFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waiting Passenger Stream */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-brand-900 text-sm flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-brand-600" />
              Upcoming Passenger Queue
            </h3>
            <span className="text-xs font-semibold text-gray-500">Live Queue Numbers</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Regular Shared</span>
              {boardData?.upcoming_regular?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {boardData.upcoming_regular.map((num, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-brand-50 text-brand-900 font-extrabold text-xs rounded-lg border border-brand-200 tabular-nums"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">No waiting regular passengers</span>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Special Solo</span>
              {boardData?.upcoming_special?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {boardData.upcoming_special.map((num, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-amber-50 text-amber-900 font-extrabold text-xs rounded-lg border border-amber-200 tabular-nums"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">No waiting special passengers</span>
              )}
            </div>
          </div>
        </div>

        {/* Driver FIFO Queue Roster */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-brand-900 text-sm flex items-center">
              <Bike className="w-4 h-4 mr-1.5 text-gold-600" />
              Driver FIFO Roster (Turn Order)
            </h3>
            <span className="text-xs font-semibold text-gray-500">First-In, First-Out</span>
          </div>

          <div className="space-y-2">
            {boardData?.drivers_in_queue?.length > 0 ? (
              boardData.drivers_in_queue.map((d, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-xl border text-xs ${
                    index === 0
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs tabular-nums ${
                        index === 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900">Tricycle #{d.body_number}</span>
                      <span className="text-gray-500 ml-2">({d.driver_name})</span>
                      <div className="text-[10px] text-gray-400">Plate: {d.plate_number}</div>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                      Head of Line (Next Out)
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No drivers currently in queue</span>
            )}
          </div>
        </div>
      </div>

      {/* Fare Matrix Simulator & Verification Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fare Calculator Simulator */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-subtle space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Calculator className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-brand-900 text-sm">Official Fare Calculator Simulator</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Simulated Distance (km)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={simDist}
                onChange={(e) => setSimDist(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold">
                <input
                  type="radio"
                  checked={simType === 'REGULAR'}
                  onChange={() => setSimType('REGULAR')}
                />
                <span>Regular (₱20 Base)</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer font-semibold">
                <input
                  type="radio"
                  checked={simType === 'SPECIAL'}
                  onChange={() => setSimType('SPECIAL')}
                />
                <span>Special (₱60 Base)</span>
              </label>
            </div>

            <label className="flex items-center space-x-1.5 cursor-pointer font-semibold pt-1">
              <input
                type="checkbox"
                checked={simDiscount}
                onChange={(e) => setSimDiscount(e.target.checked)}
              />
              <span>Apply 20% Statutory Discount (Student / Senior / PWD)</span>
            </label>

            {simResult && (
              <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 space-y-1.5 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Base Fare:</span>
                  <span className="font-bold tabular-nums">₱{simResult.base.toFixed(2)}</span>
                </div>
                {simResult.extra > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Extra ({simResult.extra.toFixed(2)} km × ₱{simResult.rate}):</span>
                    <span className="font-bold tabular-nums">+₱{simResult.charge.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-brand-200 pt-2 flex justify-between font-extrabold text-brand-900 text-base">
                  <span>Calculated Fare:</span>
                  <span className="tabular-nums">₱{simResult.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pending Discount Approval Roster */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-brand-900 text-sm">Discount ID Approval Queue</h3>
            <span className="text-xs text-gray-500 font-semibold">{pendingDiscounts.length} Pending</span>
          </div>

          <div className="space-y-3">
            {pendingDiscounts.length > 0 ? (
              pendingDiscounts.map((d) => (
                <div key={d.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{d.first_name} {d.last_name} ({d.username})</div>
                    <div className="text-[11px] text-amber-800 font-semibold">{d.discount_type} ID Verification</div>
                  </div>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleVerifyDiscount(d.id, true)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      title="Approve 20% Discount"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleVerifyDiscount(d.id, false)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic block py-4 text-center">
                All submitted passenger discount IDs are reviewed and verified!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal (Admin) */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => { setScannerOpen(false); setScanResult(null); }}
        onScanSuccess={handleAdminScan}
        title="Admin Ticket Inspection"
      />

      {/* Scan Result Banner */}
      {scanResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between shadow-subtle text-xs">
          <div>
            <span className="font-extrabold text-sm block mb-0.5">✓ Ticket Verified — [{scanResult.data.queue_number}]</span>
            <span className="text-emerald-700">
              {scanResult.data.passenger_name} · {scanResult.data.destination} · 
              Fare: <strong>₱{scanResult.data.computed_fare?.toFixed(2)}</strong>
              {scanResult.data.is_discounted && ' (20% Discount Applied)'}
            </span>
          </div>
          <button onClick={() => setScanResult(null)} className="ml-4 text-emerald-500 hover:text-emerald-700 font-bold text-base">✕</button>
        </div>
      )}
    </div>
  );
}
