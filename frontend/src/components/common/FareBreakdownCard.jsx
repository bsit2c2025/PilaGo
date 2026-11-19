import React from 'react';
import { Tag, MapPin, Info } from 'lucide-react';

export default function FareBreakdownCard({ fareData, tripType, isDiscounted }) {
  if (!fareData) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-subtle space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <Info className="w-3.5 h-3.5 text-brand-600" />
          <span>Official Fare Breakdown</span>
        </div>
        {isDiscounted && (
          <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
            <Tag className="w-3 h-3 mr-1 text-gold-700" />
            20% Statutory Discount
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Base Fare (First 2.0 km)</span>
          <span className="font-semibold text-gray-900 tabular-nums">₱{fareData.base_fare?.toFixed(2)}</span>
        </div>

        {fareData.extra_km > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Extra Distance ({fareData.extra_km} km × ₱{fareData.km_rate?.toFixed(2)})</span>
            <span className="font-semibold text-gray-900 tabular-nums">+₱{fareData.distance_charge?.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-500 pt-1">
          <span>Trip Type:</span>
          <span className="font-medium text-gray-700">{tripType === 'SPECIAL' ? 'Special Solo Trip' : 'Regular Shared Trip'}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 block">Total Due</span>
          <span className="text-[11px] font-medium text-emerald-700">Cash on Drop-off</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-brand-900 tabular-nums">
            ₱{fareData.total_fare?.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
