import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Rocket, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../App';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const passStrength = (() => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'var(--accent-rose)' };
    if (score <= 3) return { level: score, label: 'Medium', color: 'var(--accent-amber)' };
    return { level: score, label: 'Strong', color: 'var(--accent-emerald)' };
  })();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation (matches backend rules)
    if (formData.full_name.trim().length < 2) { setError('Full name must be at least 2 characters'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email address'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await authAPI.register(formData);
      // Auto-login after register
      const res = await authAPI.login({ email: formData.email, password: formData.password });
      login(res.data.access_token, { email: formData.email, full_name: formData.full_name });
      navigate('/dashboard');
    } catch (err) {
      // FIX: Removed fake demo-token bypass — was allowing unauthenticated access
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the server. Please ensure the backend is running on https://ai-powered-resume-filter-and-career.onrender.com');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center min-h-[85vh] px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel p-8 md:p-10 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px]"
          style={{ background: 'rgba(34, 211, 238, 0.1)' }} />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[60px]"
          style={{ background: 'rgba(99, 102, 241, 0.1)' }} />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--gradient-cool)' }}
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Start your AI-powered career journey</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.2)', color: 'var(--accent-rose)' }}>
              <AlertCircle size={16} />{error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="text" required className="input-dark" placeholder="John Doe"
                  value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="email" required className="input-dark" placeholder="you@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} required className="input-dark pr-10" placeholder="Min. 6 characters"
                  value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passStrength.level ? passStrength.color : 'rgba(100,116,139,0.2)' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: passStrength.color }}>{passStrength.label}</span>
                </div>
              )}
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--gradient-cool)', color: 'white', boxShadow: '0 4px 15px rgba(34, 211, 238, 0.2)' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--accent-cyan)' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
