import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, Clock, Brain, Shield, TrendingUp, Award } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import { useCountUp } from '../../hooks/useCountUp';

const StatCard = ({ label, value, suffix = '', icon, color, bg, delay = 0 }) => {
  const numericVal = typeof value === 'number' ? value : parseInt(value) || 0;
  const animatedVal = useCountUp(numericVal, 1200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: `0 8px 30px ${bg}` }}
      className="glass-card p-5 relative overflow-hidden group cursor-default"
    >
      {/* Glow effect */}
      <div
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-[30px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: color }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <h3 className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {animatedVal}{suffix}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

const QuickStats = () => {
  const { hasData, skills, bestMatch, roadmap, insights } = useAnalysis();

  if (!hasData) return null;

  const matchScore = bestMatch?.match_score || 0;
  const atsScore = insights?.ats_score || 0;
  const readinessScore = insights?.career_readiness_score || 0;
  const techCount = insights?.technical_skills_count || skills.length;
  const softCount = insights?.soft_skills_count || 0;
  const confidence = insights?.confidence_score || 0;
  const hiringProb = insights?.hiring_probability || 0;

  const stats = [
    { label: 'Total Skills', value: skills.length, icon: <Zap className="w-5 h-5" />, color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
    { label: 'Career Match', value: matchScore, suffix: '%', icon: <Target className="w-5 h-5" />, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    { label: 'ATS Score', value: atsScore, suffix: '%', icon: <Shield className="w-5 h-5" />, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
    { label: 'Readiness', value: readinessScore, suffix: '%', icon: <TrendingUp className="w-5 h-5" />, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    { label: 'Technical', value: techCount, icon: <Brain className="w-5 h-5" />, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    { label: 'Soft Skills', value: softCount, icon: <Award className="w-5 h-5" />, color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
    { label: 'Confidence', value: confidence, suffix: '%', icon: <Zap className="w-5 h-5" />, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    { label: 'Hiring Prob.', value: hiringProb, suffix: '%', icon: <BookOpen className="w-5 h-5" />, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i + 2} />
      ))}
    </div>
  );
};

export default QuickStats;
