import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, User, LogOut, Briefcase, Map, Upload, LayoutDashboard, Menu, X, Sparkles, Heart, TrendingUp, IndianRupee, Bot, Video } from 'lucide-react';
import { AuthContext } from '../App';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/upload', label: 'Analyze', icon: <Upload size={16} /> },
    { to: '/roadmap', label: 'Roadmap', icon: <Map size={16} /> },
    { to: '/jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { to: '/passion', label: 'Passion', icon: <Heart size={16} /> },
    { to: '/trends', label: 'Trends', icon: <TrendingUp size={16} /> },
    { to: '/salary', label: 'Salary', icon: <IndianRupee size={16} /> },
    { to: '/mentor', label: 'AI Mentor', icon: <Bot size={16} /> },
    { to: '/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      background: 'rgba(6, 8, 15, 0.85)',
      backdropFilter: 'blur(20px)',
      borderColor: 'var(--border-subtle)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-accent)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="gradient-text">Career</span>
              <span style={{ color: 'var(--text-primary)' }}>Pulse</span>
              <span className="text-xs ml-1 font-bold" style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                    style={{
                      color: isActive(link.to) ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                      background: isActive(link.to) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(link.to)) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(link.to)) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {link.icon}
                    {link.label}
                    {isActive(link.to) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: 'var(--gradient-accent)' }}
                      />
                    )}
                  </Link>
                ))}
                <div className="w-px h-6 mx-2" style={{ background: 'var(--border-subtle)' }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  style={{ color: 'var(--accent-rose)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 113, 133, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5 rounded-xl">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t"
            style={{
              background: 'rgba(6, 8, 15, 0.95)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {isAuthenticated ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{
                        color: isActive(link.to) ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                        background: isActive(link.to) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full"
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-xl"
                    style={{ color: 'var(--text-secondary)' }}
                  >Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium rounded-xl btn-primary text-center"
                  >Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
