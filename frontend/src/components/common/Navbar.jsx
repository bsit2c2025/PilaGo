import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Tv, Shield, Bike, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
            <span className="text-gold-500">P</span>G
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-brand-900">Pila<span className="text-brand-600">Go</span></span>
            <span className="hidden sm:inline-block text-xs text-gray-500 ml-2 px-2 py-0.5 bg-brand-50 rounded-full font-medium">Tricycle Queue & Fare</span>
          </div>
        </Link>

        {/* Navigation Links based on role */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/board/bayan-central"
            target="_blank"
            className="flex items-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
            title="Open public terminal queue display screen"
          >
            <Tv className="w-4 h-4 mr-1.5 text-brand-600" />
            <span className="hidden sm:inline">TV Queue Board</span>
            <span className="sm:hidden">TV</span>
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center ${
                    location.pathname === '/admin' ? 'bg-brand-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  Admin
                </Link>
              )}

              {user.role === 'DRIVER' && (
                <Link
                  to="/driver"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center ${
                    location.pathname === '/driver' ? 'bg-brand-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5 mr-1 text-gold-500" />
                  Driver View
                </Link>
              )}

              <Link
                to="/passenger"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center ${
                  location.pathname === '/passenger' ? 'bg-brand-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 mr-1" />
                Passenger
              </Link>

              {/* User Chip */}
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-gray-900">{user.full_name || user.username}</div>
                  <div className="text-[10px] uppercase font-semibold text-brand-600 tracking-wider">
                    {user.role} {user.is_discount_verified && `• ${user.discount_type}`}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-semantic-destructive hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
