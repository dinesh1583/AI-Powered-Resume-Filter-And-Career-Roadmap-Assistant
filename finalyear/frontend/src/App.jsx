import React, { createContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeUpload from './pages/ResumeUpload';
import Roadmap from './pages/Roadmap';
import Jobs from './pages/Jobs';
import PassionGuide from './pages/PassionGuide';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import IndustryTrends from './pages/IndustryTrends';
import SalaryPredictor from './pages/SalaryPredictor';
import AIMentor from './pages/AIMentor';
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import ErrorBoundary from './components/ErrorBoundary';
import { authAPI } from './services/api';
import { AnalysisProvider } from './context/AnalysisContext';

// Auth Context
export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('analysisResult');
    setToken(null);
    setUser(null);
  }, []);

  // Validate token and refresh user data on app load
  useEffect(() => {
    const validateAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err) {
        // Token invalid or expired — log out
        if (err.response?.status === 401) {
          console.warn('Token expired, logging out');
          logout();
        } else {
          // Network error — use cached user data
          const stored = localStorage.getItem('user');
          if (stored) {
            try { setUser(JSON.parse(stored)); } catch {}
          }
        }
      } finally {
        setAuthLoading(false);
      }
    };

    validateAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/passion" element={<ProtectedRoute><PassionGuide /></ProtectedRoute>} />
        <Route path="/trends" element={<ProtectedRoute><IndustryTrends /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><SalaryPredictor /></ProtectedRoute>} />
        <Route path="/mentor" element={<ProtectedRoute><AIMentor /></ProtectedRoute>} />
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnalysisProvider>
          <Router>
            <div className="relative min-h-screen">
              <ParticleBackground />
              <Navbar />
              <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AnimatedRoutes />
              </main>
            </div>
          </Router>
        </AnalysisProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
