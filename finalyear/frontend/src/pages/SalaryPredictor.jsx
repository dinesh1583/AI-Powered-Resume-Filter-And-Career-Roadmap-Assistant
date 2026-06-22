import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, MapPin, Briefcase, TrendingUp, Loader2, Star, Check, ShieldCheck, Zap } from 'lucide-react';
import { salaryAPI } from '../services/api';

const GlassyCard = ({ children, className = '' }) => (
  <div className={`relative bg-[#0a0c16]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent"></div>
    {children}
  </div>
);

const SalaryPredictor = () => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    career: 'Full Stack Developer',
    experience_years: 1,
    location: 'Bangalore',
    company_tier: 'Any',
    has_certification: false,
    certification_name: 'None',
    skills: []
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await salaryAPI.getOptions();
        setOptions(res.data);
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await salaryAPI.predict(formData);
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setPredicting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-emerald-400 animate-spin mb-4" />
        <p className="text-emerald-400 font-display tracking-widest uppercase text-sm animate-pulse">Loading ML Valuation Models...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 px-4 sm:px-6 space-y-10">
      
      {/* Hero */}
      <div className="relative text-center pt-8 pb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[300px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent blur-3xl -z-10 rounded-full"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] text-emerald-400 text-sm font-medium mb-6 backdrop-blur-md"
        >
          <ShieldCheck size={16} /> Market Valuation Engine
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-tight"
        >
          Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">True Value</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Stop guessing. Use our AI-driven salary model tailored for the Indian tech ecosystem. Factor in location, premium skills, and company tier instantly.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5"
        >
          <GlassyCard className="p-8">
            <h2 className="text-xl font-display font-semibold text-white mb-8 flex items-center gap-3">
              <Briefcase className="text-cyan-400" /> Career Profile Setup
            </h2>
            
            <form onSubmit={handlePredict} className="space-y-6">
              {/* Career */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Role</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                    value={formData.career}
                    onChange={(e) => setFormData({...formData, career: e.target.value})}
                  >
                    {options?.careers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Zap size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Experience & Location */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience (Yrs)</label>
                  <input 
                    type="number" min="0" max="40" step="0.5"
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    >
                      {options?.locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MapPin size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Tier */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Tier</label>
                <select 
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                  value={formData.company_tier}
                  onChange={(e) => setFormData({...formData, company_tier: e.target.value})}
                >
                  {options?.company_tiers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Premium Tech Skills</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="E.g. Generative AI, MLOps..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" onClick={addSkill} className="px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      key={skill} 
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-sm flex items-center gap-2 group"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="opacity-50 group-hover:opacity-100 hover:text-red-400 transition-opacity">&times;</button>
                    </motion.span>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={predicting}
                className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out"></div>
                {predicting ? <Loader2 size={20} className="animate-spin" /> : <IndianRupee size={20} />}
                {predicting ? 'Running Neural Models...' : 'Calculate Market Value'}
              </button>
            </form>
          </GlassyCard>
        </motion.div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!prediction ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full min-h-[500px]"
              >
                <GlassyCard className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="w-24 h-24 border border-[rgba(255,255,255,0.1)] bg-[#0d1117] rounded-2xl flex items-center justify-center rotate-12 relative z-10 shadow-2xl">
                      <IndianRupee size={48} className="text-emerald-400/50" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-white mb-3">Awaiting Parameters</h3>
                  <p className="text-gray-400 max-w-sm text-lg font-light leading-relaxed">
                    Configure your career profile on the left to generate an ultra-precise compensation breakdown.
                  </p>
                </GlassyCard>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="space-y-6"
              >
                {/* Big Number Card */}
                <div className="relative bg-gradient-to-br from-emerald-900/40 to-[#0a0c16] border border-emerald-500/30 rounded-3xl p-10 overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                        <Zap size={16} /> Estimated Base Compensation
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter">
                          {prediction.predicted_min_lpa}
                          <span className="text-4xl md:text-6xl text-gray-500 font-light mx-2">-</span>
                          {prediction.predicted_max_lpa}
                        </h2>
                        <span className="text-2xl font-medium text-emerald-400/80 mb-2 tracking-wide">LPA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factors Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {prediction.key_factors.map((factor, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      key={i} 
                      className="p-5 rounded-2xl bg-[#0a0c16] border border-[rgba(255,255,255,0.05)] relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: factor.color, opacity: 0.5 }}></div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{factor.factor}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="font-bold text-white text-lg truncate" title={factor.value}>{factor.value || "Standard"}</p>
                        <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)]" style={{ color: factor.color }}>
                          {factor.impact}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* AI Negotiation Tips */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-[#0a0c16] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                  <h3 className="text-lg font-display font-bold text-white mb-5 flex items-center gap-3">
                    <Star size={20} className="text-cyan-400 fill-cyan-400/20" /> Tactical Negotiation Guide
                  </h3>
                  <div className="space-y-4">
                    {prediction.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 transition-colors">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-cyan-400" />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SalaryPredictor;
