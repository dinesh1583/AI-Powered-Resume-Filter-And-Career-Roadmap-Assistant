import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ShieldAlert, Cpu, Globe, ArrowUpRight, Zap, Target, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { trendsAPI } from '../services/api';

const FuturisticCard = ({ children, className = '', delay = 0, glow = 'cyan' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }}
    className={`relative group ${className}`}
  >
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-${glow}-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
    <div className="relative h-full bg-[#0a0c16] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent"></div>
      {children}
    </div>
  </motion.div>
);

const IndustryTrends = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('careers'); // careers, skills, companies

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await trendsAPI.getSummary();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load trends", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
          <Cpu size={32} className="text-cyan-400 animate-pulse" />
        </div>
        <p className="mt-6 text-cyan-400 font-display tracking-widest uppercase text-sm animate-pulse">Initializing Global Intelligence</p>
      </div>
    );
  }

  if (!data) return null;

  const formatSalaryChartData = () => {
    const years = ['2022', '2023', '2024', '2025', '2026'];
    return years.map(year => {
      const point = { year };
      Object.keys(data.salary_trends).forEach(career => {
        point[career] = data.salary_trends[career][year];
      });
      return point;
    });
  };

  // Mock radar data for hot skills
  const radarData = [
    { subject: 'AI/LLMs', A: 99, fullMark: 100 },
    { subject: 'Cloud Native', A: 95, fullMark: 100 },
    { subject: 'Web3', A: 78, fullMark: 100 },
    { subject: 'Data Eng', A: 88, fullMark: 100 },
    { subject: 'CyberSec', A: 91, fullMark: 100 },
    { subject: 'UX Design', A: 85, fullMark: 100 },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Hero Section */}
      <div className="relative text-center pt-8 pb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.2)] text-cyan-400 text-sm font-medium mb-6 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Global Intelligence Network
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-tight"
        >
          Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Work</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Navigate the post-AI technological landscape. Real-time metrics on hyper-growth careers, dying jobs, and exactly what the top 1% are building.
        </motion.p>
      </div>

      {/* Futuristic Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Active Opportunities", val: "125K+", icon: Globe, color: "from-blue-500 to-cyan-500" },
          { title: "YoY Market Growth", val: "+18%", icon: TrendingUp, color: "from-emerald-400 to-green-600" },
          { title: "AI Replacement Risk", val: "31%", icon: ShieldAlert, color: "from-rose-500 to-orange-500" },
          { title: "Premium Skill Boost", val: "+35%", icon: Sparkles, color: "from-purple-500 to-indigo-500" }
        ].map((stat, i) => (
          <FuturisticCard key={i} delay={0.1 * i} className="text-center p-6">
            <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${stat.color} p-[1px] mb-4`}>
              <div className="w-full h-full bg-[#0a0c16] rounded-full flex items-center justify-center">
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-display font-bold text-white mb-1">{stat.val}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest">{stat.title}</p>
          </FuturisticCard>
        ))}
      </div>

      {/* Main Grid: Trending Roles vs AI Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Careers (Takes up 8 columns) */}
        <div className="lg:col-span-8">
          <FuturisticCard delay={0.4}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                <Zap className="text-amber-400 fill-amber-400/20" /> Hyper-Growth Roles
              </h2>
              <button className="text-xs px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {data.top_careers.map((career, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (0.1 * i) }}
                  className="group relative p-5 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent border border-[rgba(255,255,255,0.05)] hover:border-[rgba(6,182,212,0.3)] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-white/5" style={{ background: `linear-gradient(135deg, ${career.color}20, transparent)` }}>
                        {career.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{career.title}</h3>
                        <p className="text-sm text-gray-400">{career.category} • <span className="text-gray-300 font-medium">₹{career.avg_salary_lpa} LPA</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 sm:pr-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Growth</p>
                        <p className="text-emerald-400 font-bold flex items-center justify-end gap-1 text-lg">
                          {career.growth_rate} <ArrowUpRight size={18} strokeWidth={3} />
                        </p>
                      </div>
                      <div className="hidden sm:block text-right w-24">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Demand</p>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${career.demand_score}%` }}
                            transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FuturisticCard>
        </div>

        {/* AI Radar & Risk (Takes up 4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Skill Radar */}
          <FuturisticCard delay={0.5} className="flex-1 flex flex-col">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-2">
              <Target className="text-purple-400" /> Skill Demand Matrix
            </h2>
            <p className="text-xs text-gray-400 mb-4">Relative market demand by sector</p>
            <div className="flex-1 min-h-[250px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Demand" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0a0c16', borderColor: '#1f2937', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </FuturisticCard>

          {/* AI Risk Zone */}
          <FuturisticCard delay={0.6} glow="rose">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-6">
              <AlertTriangle className="text-rose-500 fill-rose-500/20" /> AI Replacement Risk
            </h2>
            
            <div className="space-y-5">
              {data.highest_risk.slice(0, 3).map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{r.career}</span>
                    <span className="text-rose-400 font-bold">{r.risk_pct}% Risk</span>
                  </div>
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${r.risk_pct}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 blur-2xl"></div>
              <p className="text-xs text-rose-200/70 leading-relaxed relative z-10">
                Roles reliant on repetitive data entry or basic coding are seeing rapid automation. Pivot to architecture, strategy, or high-level AI prompt engineering.
              </p>
            </div>
          </FuturisticCard>
        </div>
      </div>

      {/* Salary Trend Area Chart */}
      <FuturisticCard delay={0.7}>
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-white">Trajectory Matrix: Compensation (LPA)</h2>
          <p className="text-gray-400 mt-2">5-year historical and projected base salary scaling in the Indian tech ecosystem.</p>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatSalaryChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDevOps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#4b5563" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#4b5563" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 12, 22, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              
              <Area type="monotone" dataKey="AI Engineer" stroke="#06b6d4" fill="url(#colorAI)" strokeWidth={3} activeDot={{ r: 8, strokeWidth: 0, fill: '#06b6d4' }} />
              <Area type="monotone" dataKey="DevOps Engineer" stroke="#a855f7" fill="url(#colorDevOps)" strokeWidth={3} activeDot={{ r: 8, strokeWidth: 0, fill: '#a855f7' }} />
              <Area type="monotone" dataKey="Full Stack Developer" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FuturisticCard>

    </div>
  );
};

export default IndustryTrends;
