import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Bike, Shield, Tv, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-brand-100 text-brand-800 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <span>🇵🇭 Digitizing the Filipino Tricycle Pila</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-900 tracking-tight">
          Fair turns, transparent fares, zero disputes.
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          PilaGo modernizes tricycle terminals across the Philippines with automated FIFO dispatch,
          municipal fare calculation, and real-time public queue displays.
        </p>
      </div>

      {/* Role Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Passenger Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-brand-900">Passenger Portal</h3>
            <p className="text-xs text-gray-500 leading-normal">
              Join the terminal queue remotely or by scanning on-site QR. View verified fares and track your turn in real time.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Shared & Solo options</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> 20% Student/Senior discount</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Digital QR ticket receipt</li>
            </ul>
          </div>
          <Link
            to="/passenger"
            className="mt-6 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition"
          >
            Enter Passenger Queue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Driver Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-gold-700 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-brand-900">Tricycle Driver Portal</h3>
            <p className="text-xs text-gray-500 leading-normal">
              Check in to the terminal FIFO queue. Receive dispatch notifications and view assigned passenger drop-offs.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Guaranteed FIFO fairness</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Manual departure override</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Direct revenue tally</li>
            </ul>
          </div>
          <Link
            to="/driver"
            className="mt-6 w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition"
          >
            Driver Check-In & Queue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Admin Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-subtle hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-brand-900">Terminal Dispatcher</h3>
            <p className="text-xs text-gray-500 leading-normal">
              Manage terminal queues, review student & senior discount IDs, adjust fare matrices, and monitor live dispatches.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2">
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Live dual-queue monitor</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Fare matrix calculator</li>
              <li className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" /> Discount approval desk</li>
            </ul>
          </div>
          <Link
            to="/admin"
            className="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition"
          >
            Open Dispatch Panel
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Terminal Board Banner */}
      <div className="bg-gradient-to-r from-[#12345A] to-[#174675] rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center text-xs font-bold text-gold-500 bg-white/10 px-3 py-1 rounded-full">
            <Tv className="w-3.5 h-3.5 mr-1.5" /> Public Terminal Monitor
          </div>
          <h2 className="text-2xl font-extrabold">Public Waiting Shed TV Queue Board</h2>
          <p className="text-xs text-gray-300 max-w-lg">
            High-contrast screen designed for waiting sheds and outdoor terminals. Shows called queue numbers, assigned tricycle body numbers, and audio chimes.
          </p>
        </div>
        <Link
          to="/board/bayan-central"
          target="_blank"
          className="whitespace-nowrap bg-gold-500 hover:bg-gold-700 text-gray-950 font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-lg flex items-center"
        >
          Launch Fullscreen TV Display
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
