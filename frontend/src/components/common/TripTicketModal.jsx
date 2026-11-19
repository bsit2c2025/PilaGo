import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, ShieldCheck, MapPin, Bike } from 'lucide-react';

export default function TripTicketModal({ isOpen, onClose, ticketData }) {
  if (!isOpen || !ticketData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Municipal Trip Ticket
          </div>
          <h3 className="text-xl font-extrabold text-brand-900">Digital Trip Pass</h3>
          <p className="text-xs text-gray-500 font-mono">{ticketData.ticket_token || ticketData.ticket_qr_token}</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-brand-50 p-4 rounded-xl flex flex-col items-center justify-center mb-5 border border-brand-100">
          <QRCodeSVG
            value={`https://pilago.ph/verify/${ticketData.ticket_token || ticketData.ticket_qr_token}`}
            size={160}
            level="M"
            className="rounded-lg shadow-sm bg-white p-2"
          />
          <span className="text-[11px] text-brand-700 font-semibold mt-2.5">Show this to tricycle driver or dispatcher</span>
        </div>

        {/* Details Table */}
        <div className="space-y-2.5 text-xs text-gray-600 border-t border-b border-gray-100 py-3 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Queue Number:</span>
            <span className="font-extrabold text-brand-900 text-sm tabular-nums">{ticketData.queue_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Destination:</span>
            <span className="font-semibold text-gray-800 text-right">{ticketData.destination_name || ticketData.destination?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Distance:</span>
            <span className="font-semibold text-gray-800">{ticketData.distance_km} km</span>
          </div>
          {ticketData.assigned_tricycle && (
            <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg text-amber-900 font-medium">
              <span className="flex items-center">
                <Bike className="w-3.5 h-3.5 mr-1 text-gold-700" />
                Assigned Tricycle:
              </span>
              <span className="font-bold">Body #{ticketData.assigned_tricycle.body_number}</span>
            </div>
          )}
          <div className="flex justify-between pt-1">
            <span className="font-bold text-gray-900 text-sm">Official Fare Due:</span>
            <span className="font-extrabold text-emerald-700 text-base tabular-nums">
              ₱{Number(ticketData.computed_fare).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="text-center">
          <p className="text-[11px] text-gray-400">
            Payment is cash upon arrival. No additional unlisted baggage or dispatch fees permitted.
          </p>
          <button
            onClick={onClose}
            className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
