import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, LogOut, Menu, X, ShoppingCart, Package, Users } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../hooks/useNotifications';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { totals } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsNotificationOpen(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'farmer':
        return <Package className="w-4 h-4" />;
      case 'admin':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const navLinkClass = ({ isActive }) => (
    `relative px-3 py-2 rounded-md text-sm font-medium transition-all ` +
    `${isActive ? 'text-primary-700' : 'text-gray-700 hover:text-primary-600'} ` +
    `after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 ` +
    `after:bg-gradient-to-r after:from-green-500 after:to-blue-500 after:transition-all ` +
    `hover:after:w-full`
  );

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 backdrop-blur-md bg-gradient-to-r from-white/70 to-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">🌱</span>
              </div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                <span className="gradient-text">Farmers Market</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            
            {isAuthenticated() && (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  Orders
                </NavLink>
                
                {user?.role === 'farmer' && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                )}
                
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}

                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </>
            )}
          </div>

          {/* Right side - Auth & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => window.__openCart && window.__openCart()}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-white/70 shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" />
              {totals.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow ring-1 ring-white">{totals.count}</span>
              )}
            </button>
            {isAuthenticated() && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-full hover:bg-white/70 shadow-sm"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow ring-1 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-200">
                        <Link
                          to="/notifications"
                          className="text-sm text-primary-600 hover:text-primary-700"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated() ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 px-3 py-1.5 rounded-full bg-white/70 shadow hover-lift">
                    {getRoleIcon(user?.role)}
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-gray-500">({user?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-full hover:bg-white/70"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2 rounded-lg hover:bg-white/70"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/80 rounded-lg mt-2 shadow">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated() && (
                <>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  
                  {user?.role === 'farmer' && (
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
