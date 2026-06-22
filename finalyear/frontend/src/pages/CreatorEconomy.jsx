import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, IndianRupee, Users, ArrowRight, Play, Calculator, Sparkles, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { creatorAPI } from '../services/api';

const CreatorEconomy = () => {
  const [niches, setNiches] = useState([]);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Calculator State
  const [calcData, setCalcData] = useState({
    platform: 'YouTube',
    views_per_month: 100000,
    niche_multiplier: 1.0
  });
  const [incomeResult, setIncomeResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const res = await creatorAPI.getNiches();
        setNiches(res.data.niches);
        setSelectedNiche(res.data.niches[0]); // Select first by default
      } catch (err) {
        console.error("Failed to load niches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNiches();
  }, []);

  const handleCalculate = async (e) => {
    e?.preventDefault();
    setCalculating(true);
    try {
      const multiplier = selectedNiche?.niche.includes('Finance') ? 2.5 : 
                         selectedNiche?.niche.includes('Tech') ? 1.5 : 
                         selectedNiche?.niche.includes('Gaming') ? 0.7 : 1.0;
                         
      const res = await creatorAPI.calculateIncome({
        ...calcData,
        niche_multiplier: multiplier
      });
      setIncomeResult(res.data);
    } catch (err) {
      console.error("Calculation failed", err);
    } finally {
      setCalculating(false);
    }
  };

  // Auto-calculate when niche changes
  useEffect(() => {
    if (selectedNiche) {
      handleCalculate();
    }
  }, [selectedNiche]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-cyan-400">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p>Loading creator economy data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-4"
        >
          <Video size={16} /> Welcome to the Creator Economy
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
        >
          Build an Empire from your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Bedroom</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          Explore high-paying digital creator niches, calculate your income potential, and discover the exact skills and AI tools needed to scale.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Niche Explorer */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Niche selector chips */}
          <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide">
            {niches.map((niche, i) => (
              <button
                key={i}
                onClick={() => setSelectedNiche(niche)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                  selectedNiche?.niche === niche.niche 
                    ? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)] text-white shadow-lg' 
                    : 'bg-[rgba(0,0,0,0.2)] border-[rgba(255,255,255,0.05)] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{niche.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{niche.niche.split(' ')[0]} {niche.niche.split(' ')[1] || ''}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedNiche && (
              <motion.div
                key={selectedNiche.niche}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card border border-[var(--glass-border)] rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20" style={{ backgroundColor: selectedNiche.color }}></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                          {selectedNiche.icon} {selectedNiche.niche}
                        </h2>
                        <p className="text-gray-300">{selectedNiche.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-xs font-medium text-white">
                          {selectedNiche.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)] border-t border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)]">
                  
                  {/* Left Column */}
                  <div className="p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Play size={16} className="text-cyan-400" /> Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNiche.required_skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-sm text-gray-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" /> AI Tools Used
                      </h3>
                      <ul className="space-y-2">
                        {selectedNiche.ai_tools.map((tool, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle2 size={14} className="text-purple-500" /> {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <IndianRupee size={16} className="text-emerald-400" /> Monetization Methods
                      </h3>
                      <div className="space-y-3">
                        {selectedNiche.monetization.map((method, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{method}</span>
                            <div className="h-1.5 w-16 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${100 - (i * 20)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--glass-border)]">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Time to Monetize</p>
                        <p className="text-sm font-semibold text-white">{selectedNiche.time_to_monetize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Difficulty</p>
                        <p className={`text-sm font-semibold ${selectedNiche.difficulty.includes('High') || selectedNiche.difficulty.includes('Extreme') ? 'text-rose-400' : 'text-amber-400'}`}>
                          {selectedNiche.difficulty}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Income Calculator */}
        <div className="lg:col-span-4">
          <div className="glass-card border border-[var(--glass-border)] rounded-2xl sticky top-24">
            <div className="p-6 border-b border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                <Calculator className="text-rose-400" /> Income Calculator
              </h2>
              <p className="text-xs text-gray-400 mt-1">Estimate your monthly creator earnings</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {['YouTube', 'Instagram', 'LinkedIn', 'Twitter'].map(p => (
                    <button
                      key={p}
                      onClick={() => { setCalcData({...calcData, platform: p}); setTimeout(handleCalculate, 50); }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        calcData.platform === p
                          ? 'bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.3)] text-white border'
                          : 'bg-[rgba(0,0,0,0.2)] border-[rgba(255,255,255,0.05)] border text-gray-400 hover:bg-[rgba(255,255,255,0.05)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                  <span>Monthly Views</span>
                  <span className="text-rose-400 font-semibold">{(calcData.views_per_month / 1000).toFixed(0)}K</span>
                </label>
                <input 
                  type="range" 
                  min="10000" 
                  max="10000000" 
                  step="10000"
                  value={calcData.views_per_month}
                  onChange={(e) => { setCalcData({...calcData, views_per_month: parseInt(e.target.value)}); }}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="w-full accent-rose-500 bg-gray-700 h-1.5 rounded-full appearance-none outline-none"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10K</span>
                  <span>10M</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {incomeResult && (
                  <motion.div
                    key={incomeResult.views_per_month + incomeResult.platform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t border-[var(--glass-border)]"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Estimated Monthly Income</p>
                    <div className="flex items-end gap-2 mb-4">
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                        ₹{(incomeResult.estimated_monthly_min_inr / 1000).toFixed(0)}K
                      </h3>
                      <span className="text-xl text-gray-500 pb-1">-</span>
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                        ₹{(incomeResult.estimated_monthly_max_inr / 1000).toFixed(0)}K
                      </h3>
                    </div>

                    <div className="space-y-3 mt-6">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Income Breakdown</p>
                      
                      {incomeResult.breakdown.ad_revenue_pct > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Ad Revenue</span>
                            <span className="text-cyan-400">{incomeResult.breakdown.ad_revenue_pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${incomeResult.breakdown.ad_revenue_pct}%` }}></div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">Sponsorships</span>
                          <span className="text-purple-400">{incomeResult.breakdown.sponsorship_pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${incomeResult.breakdown.sponsorship_pct}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">Digital Products/Affiliate</span>
                          <span className="text-emerald-400">{incomeResult.breakdown.affiliate_products_pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${incomeResult.breakdown.affiliate_products_pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorEconomy;
