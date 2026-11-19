import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bike, Shield, Users, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DRIVER') navigate('/driver');
      else navigate('/passenger');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username/phone or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    login(user, pass).then((userData) => {
      if (userData.role === 'ADMIN') navigate('/admin');
      else if (userData.role === 'DRIVER') navigate('/driver');
      else navigate('/passenger');
    }).catch((err) => {
      setError(err.response?.data?.detail || 'Login failed');
    });
  };

  return (
    <div className="min-h-screen bg-brand-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-900 items-center justify-center text-white font-extrabold text-2xl shadow-md mb-3">
          <span className="text-gold-500">P</span>G
        </div>
        <h2 className="text-3xl font-extrabold text-brand-900 tracking-tight">PilaGo Portal</h2>
        <p className="mt-1.5 text-sm text-gray-600">
          Smart Tricycle Queue Management & Transparent Fares
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-subtle rounded-2xl border border-gray-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Username or Phone Number
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. passenger_maria"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow transition flex items-center justify-center"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3 text-center">
              Quick Role Test Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickDemo('student_carlos', 'pass123')}
                className="p-2 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 rounded-lg text-left transition"
              >
                <div className="font-bold text-amber-900">Student (20% Off)</div>
                <div className="text-[10px] text-amber-700">carlos / pass123</div>
              </button>

              <button
                onClick={() => handleQuickDemo('senior_lola', 'pass123')}
                className="p-2 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 rounded-lg text-left transition"
              >
                <div className="font-bold text-emerald-900">Senior (20% Off)</div>
                <div className="text-[10px] text-emerald-700">lola / pass123</div>
              </button>

              <button
                onClick={() => handleQuickDemo('driver_pedro', 'driver123')}
                className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 rounded-lg text-left transition"
              >
                <div className="font-bold text-brand-900 flex items-center">
                  <Bike className="w-3 h-3 mr-1 text-gold-500" /> Driver #042
                </div>
                <div className="text-[10px] text-brand-700">pedro / driver123</div>
              </button>

              <button
                onClick={() => handleQuickDemo('admin', 'admin123')}
                className="p-2 border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 rounded-lg text-left transition"
              >
                <div className="font-bold text-purple-900 flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-purple-600" /> Admin
                </div>
                <div className="text-[10px] text-purple-700">admin / admin123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
